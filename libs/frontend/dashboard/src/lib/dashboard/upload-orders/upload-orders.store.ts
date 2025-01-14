import { inject, Injectable } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { switchMap, Observable, tap, pipe } from 'rxjs';
import { moofyPO, PdfExtractService, ComponentStoreMixinHelper, routes } from '@moofy-admin/shared';

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
          this.pdfExtractService.fetchInboundDocuments().pipe(
            tap((x) => console.log('INBOUND ORDERS', x)),
            tap((x) => console.log('aggregated', this.aggregateInboundOrdersByRoute(x))),
            tapResponse(this.onSuccess, this.onSigninError)
          )
        )
      )
    )
  );

  aggregateInboundOrdersByRoute(inboundOrders: any) {
    console.log('inboundOrders', inboundOrders);

    // Sample input data
    const documents: any = [
      /* Your document array */
    ];

    // Initialize the result object with the same keys as `routes` and empty arrays
    const result: Record<number | string, any[]> = Object.keys(routes).reduce(
      (acc, key) => {
        acc[key] = [];
        return acc;
      },
      {} as Record<number | string, any[]>
    );

    // Process documents and aggregate by route
    documents.forEach((doc: any) => {
      const locationKey = `SUPERCENTER ${doc.Location}`.trim(); // Create the location key
      console.log('locationKey', locationKey);

      // Iterate through each route to find the matching location
      for (const [routeKey, stores] of Object.entries(routes)) {
        const foundStore = (stores as any[]).find((store: any) => store.name === locationKey);

        if (foundStore) {
          result[routeKey].push(doc); // Add document to the correct route
          break; // Stop searching once the location is found
        }
      }
    });

    console.log('result', result);

    return inboundOrders;
  }

  get onSigninError() {
    return (error: any) => this.handleError(error);
  }

  get onSuccess() {
    return (files: any) => this.setInboundOrders(files);
  }
}
