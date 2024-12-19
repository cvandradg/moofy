import { inject, Injectable } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { switchMap, Observable, tap } from 'rxjs';
import {
  moofyPO,
  PdfExtractService,
  ComponentStoreMixinHelper,
} from '@moofy-admin/shared';

@Injectable({
  providedIn: 'root',
})
export class UploadOrdersStore extends ComponentStoreMixinHelper<{
  purchaseOrders: Record<string, moofyPO[]>;
}> {
  pdfExtractService = inject(PdfExtractService);

  constructor() {
    super({ purchaseOrders: {} });
  }

  readonly purchaseOrders$ = this.select((state) => state.purchaseOrders);

  readonly totalOfArticlesRequested$ = this.select((state) => {
    return this.aggregateArticles(state.purchaseOrders);
  });

  readonly aggregateArticlesPerRoute$ = this.select((state) => {
    return this.aggregateArticlesPerRoute(state.purchaseOrders);
  });

  readonly setUser = this.updater((state, purchaseOrders: any) => ({
    ...state,
    loading: false,
    purchaseOrders,
  }));

  readonly extractOrders$ = this.effect((files$: Observable<any>) =>
    files$.pipe(
      this.responseHandler(
        switchMap((files: any) =>
          this.pdfExtractService.extractOrderByRoute(files).pipe(
            tap((x) => console.log('processed files,', x)),
            tapResponse(this.onSuccess, this.onSigninError)
          )
        )
      )
    )
  );

  get onSigninError() {
    return (error: any) => this.handleError(error);
  }

  get onSuccess() {
    return (files: any) => this.setUser(files);
  }

  aggregateArticles(
    purchaseOrders: Record<string, moofyPO[]>
  ): Record<string, { totalQuantity: number; totalCost: number }> {
    const articleTotals: Record<
      string,
      { totalQuantity: number; totalCost: number }
    > = {};

    for (const key in purchaseOrders) {
      const orders = purchaseOrders[key];

      orders.forEach((order) => {
        order.items.forEach((item) => {
          const article = item.article;
          const quantity = parseFloat(item.quantity);
          const cost = parseFloat(item.cost);

          if (!articleTotals[article]) {
            // Initialize the article entry if it doesn't exist
            articleTotals[article] = { totalQuantity: 0, totalCost: 0 };
          }

          // Update total quantity and total cost
          articleTotals[article].totalQuantity += quantity;
          articleTotals[article].totalCost += quantity * cost;
        });
      });
    }

    return articleTotals;
  }

  aggregateArticlesPerRoute(
    purchaseOrders: Record<string, moofyPO[]>
  ): Record<
    string,
    { article: string; totalQuantity: number; totalCost: number }[]
  > {
    const routeTotals: Record<
      string,
      { article: string; totalQuantity: number; totalCost: number }[]
    > = {};

    for (const route in purchaseOrders) {
      const orders = purchaseOrders[route];
      const articleMap: Record<
        string,
        { totalQuantity: number; totalCost: number }
      > = {};

      orders.forEach((order) => {
        order.items.forEach((item) => {
          const article = item.article;
          const quantity = parseFloat(item.quantity);
          const cost = parseFloat(item.cost);

          if (!articleMap[article]) {
            // Initialize the article entry if it doesn't exist
            articleMap[article] = { totalQuantity: 0, totalCost: 0 };
          }

          // Update total quantity and total cost for this article
          articleMap[article].totalQuantity += quantity;
          articleMap[article].totalCost += quantity * cost;
        });
      });

      // Convert articleMap to an array and assign to the route
      routeTotals[route] = Object.entries(articleMap).map(
        ([article, totals]) => ({
          article,
          totalQuantity: totals.totalQuantity,
          totalCost: totals.totalCost,
        })
      );
    }

    return routeTotals;
  }
}
