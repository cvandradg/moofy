import { inject, Injectable } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { switchMap, Observable, tap, pipe, catchError, retry } from 'rxjs';
import { moofyPO, PdfExtractService, ComponentStoreMixinHelper, moofyToWalmartRoutes } from '@moofy-admin/shared';

type RouteKey = keyof typeof moofyToWalmartRoutes;
type AggregatedOrders = { route: RouteKey; orders: { DocumentId: number; Location: string }[] }[];

@Injectable({
  providedIn: 'root',
})
export class UploadOrdersStore extends ComponentStoreMixinHelper<{
  inboundOrders: { DocumentId: number; Location: string }[];
}> {
  pdfExtractService = inject(PdfExtractService);

  constructor() {
    super({ inboundOrders: [] });
    this.#getInboutOrders$();
  }

  readonly inboundOrders$ = this.select((state) => state.inboundOrders);

  readonly getInboundOrdersByRoute$ = this.select((state) => {
    return this.aggregateInboundOrdersByRoute(state.inboundOrders);
  });

  readonly setInboundOrders = this.updater((state, inboundOrders: { DocumentId: number; Location: string }[]) => ({
    ...state,
    loading: false,
    inboundOrders,
  }));

  readonly #getInboutOrders$ = this.effect<void>(
    pipe(
      this.responseHandler(
        switchMap(() =>
          this.pdfExtractService.walmartBotLogin().pipe(
            tap((x) => console.log('Login', x)),
            catchError((error) => {
              console.error('Login failed, retrying...', error);
              return this.pdfExtractService.walmartBotLogin().pipe(retry(1)); // Retry login once
            }),
            switchMap(() =>
              this.pdfExtractService.fetchInboundDocuments().pipe(
                tap((x) => console.log('fetchInboundDocuments', x)),
                tapResponse(this.onSuccess, this.onSigninError)
              )
            )
          )
        )
      )
    )
  );

  aggregateInboundOrdersByRoute(inboundOrders: { DocumentId: number; Location: string }[]): AggregatedOrders {
    console.log('inboundOrders', inboundOrders);

    if (
      !inboundOrders ||
      !inboundOrders.length ||
      !moofyToWalmartRoutes ||
      Object.keys(moofyToWalmartRoutes).length === 0
    ) {
      console.warn('No inbound orders or routes to process.');
      return [];
    }

    const result: Record<RouteKey, any[]> = Object.keys(moofyToWalmartRoutes).reduce(
      (acc, key) => {
        acc[key as RouteKey] = [];
        return acc;
      },
      {} as Record<RouteKey, any[]>
    );

    inboundOrders.forEach((doc) => {
      const locationKey = `${doc.Location}`.trim();

      for (const [routeKey, stores] of Object.entries(moofyToWalmartRoutes)) {
        const foundStore = (stores as any[]).find((store) => store.name === locationKey);

        if (foundStore) {
          result[routeKey as RouteKey].push(doc);
          break;
        }
      }
    });

    const transformedResult = Object.entries(result)
      .filter(([_, orders]) => orders.length > 0)
      .map(([routeKey, orders]) => ({
        route: routeKey as RouteKey,
        orders,
      }));

    console.log('transformedResult', transformedResult);

    return transformedResult;
  }

  get onSigninError() {
    return (error: any) => this.handleError(error);
  }

  get onSuccess() {
    return (files: any) => this.setInboundOrders(files);
  }
}
