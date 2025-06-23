import { groupBy, sumBy } from 'lodash';
import { inject, Injectable } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  switchMap,
  Observable,
  tap,
  pipe,
  catchError,
  retry,
  bufferCount,
  concatMap,
  forkJoin,
  reduce,
  from,
  mergeMap,
  toArray,
} from 'rxjs';
import { moofyPO, PdfExtractService, ComponentStoreMixinHelper, moofyToWalmartRoutes } from '@moofy-admin/shared';

type RouteKey = keyof typeof moofyToWalmartRoutes;
type AggregatedOrders = { route: RouteKey; orders: { DocumentId: number; Location: string }[] }[];
type inboundOrder = {
  AckStatusCode: string | null;
  AckStatusDescription: string | null;
  AifNumber: string | null;
  ApprovalTimestamp: string;
  Country: string | null;
  CreatedTimestamp: string;
  DocSplitInd: string;
  DocType: string;
  DocumentCountry: string;
  DocumentId: number;
  DocumentNumber: string;
  DocumentOpenedIndicator: string;
  DocumentStatusCode: number;
  DocumentTypeCode: number;
  EditType: string | null;
  Location: string;
  MailboxId: number;
  MailboxSystemSeparator: string | null;
  OrderDate: string;
  PdfRequestIconDisplay: string | null;
  PdfRequestJsonDetail: string | null;
  PdfStatus: string | null;
  RelatedDocumentCount: number;
  TaSlipNumber: string;
  TaSplitInd: string;
  TotalRows: number;
  TradRelId: string | null;
  VendorName: string | null;
  VendorNumber: number;
  WebEdiSetupId: string | null;
  XmlPath: string | null;
};

type PurchaseOrdeDetails = {
  purchaseOrderNumber: string;
  purchaseOrderDate: string;
  shipDate: string;
  cancelDate: string;
  additionalDetails: {
    orderType: string;
    currency: string;
    department: string;
    paymentTerms: string;
    carrier: string;
    shipTo: string;
    billTo: string;
  };
  items: {
    line: string;
    itemNumber: string;
    gtin: string;
    supplierStock: string;
    color: string;
    size: string;
    quantityOrdered: string;
    uom: string;
    pack: string;
    cost: string;
    extendedCost: string;
  }[];
  totals: {
    totalAmount: string;
    totalItems: string;
    totalUnits: string;
  };
};

@Injectable({
  providedIn: 'root',
})
export class UploadOrdersStore extends ComponentStoreMixinHelper<{
  inboundOrders: inboundOrder[];
  inboundOrderDetails: PurchaseOrdeDetails;
  currentRouteOrders: any[];
  startDate: Date | null;
  endDate: Date | null;
}> {
  pdfExtractService = inject(PdfExtractService);

  constructor() {
    super({
      inboundOrders: [],
      inboundOrderDetails: {} as PurchaseOrdeDetails,
      currentRouteOrders: [],
      startDate: new Date(new Date().setHours(0, 0, 0, 0)),
      endDate: new Date(new Date().setHours(0, 0, 0, 0)),
    });
    this.#getInboutOrders$();
  }

  readonly startDate$ = this.select((state) => state.startDate);
  readonly endDate$ = this.select((state) => state.endDate);
  readonly inboundOrders$ = this.select((state) => state.inboundOrders);
  readonly inboundOrderDetails$ = this.select((state) => state.inboundOrderDetails);
  readonly currentRouteOrders$ = this.select((state) => {
    console.log('currentRouteOrders', state.currentRouteOrders);

    const filtered = state.currentRouteOrders.filter((item) => {
      const [m, d, y] = item.orderDate.split('/').map(Number);
      const dt = new Date(y, m - 1, d);
      return (!state.startDate || dt >= state.startDate) && (!state.endDate || dt <= state.endDate);
    });

    const grouped: any[] = Object.entries(groupBy(filtered, 'itemNumber')).map(([itemNumber, items]) => {
      const totalQuantity = sumBy(items, (o) => +o.quantityOrdered);
      const totalExtended = sumBy(items, (o) => +o.extendedCost);
      const unitCost = +items[0].cost; // assume cost is per-unit
      const { gtin, supplierStock, color, size, uom, pack } = items[0];

      return {
        itemNumber,
        gtin,
        supplierStock,
        color,
        size,
        totalQuantity,
        uom,
        pack,
        unitCost,
        totalExtendedCost: totalExtended,
      };
    });

    console.log('grouped', grouped);
    // console.log('inboundOrders', state.inboundOrders);

    return grouped;
  });

  readonly getInboundOrdersByRoute$ = this.select((state) => {
    return this.aggregateInboundOrdersByRoute(state.inboundOrders);
  });

  readonly setInboundOrders = this.updater((state, inboundOrders: inboundOrder[]) => ({
    ...state,
    loading: false,
    inboundOrders,
  }));

  isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  readonly setInboundOrderDetails = this.updater((state, inboundOrderDetails: any) => ({
    ...state,
    loading: false,
    inboundOrderDetails,
  }));

  readonly setCurrentRouteOrders = this.updater((state, currentRouteOrders: any[]) => ({
    ...state,
    currentRouteOrders,
  }));

  readonly setStartDate = this.updater((state, startDate: Date | null) => ({
    ...state,
    startDate,
  }));

  readonly setEndDate = this.updater((state, endDate: Date | null) => ({
    ...state,
    endDate,
  }));

  readonly #getInboutOrders$ = this.effect<void>(
    pipe(
      this.responseHandler(
        switchMap(() =>
          this.pdfExtractService.fetchInboundDocuments().pipe(tapResponse(this.onSetInboundOrdersSuccess, this.onError))
        )
      )
    )
  );

  readonly getInboutOrderDetails$ = this.effect((inbountOrder$: Observable<any>) =>
    inbountOrder$.pipe(
      this.responseHandler(
        switchMap((inboundOrder) => {
          return this.pdfExtractService
            .getInboutOrderDetails(inboundOrder.DocumentId, inboundOrder.Location)
            .pipe(tapResponse(this.onSetInboundOrderDetailsSuccess, this.onError));
        })
      )
    )
  );

  readonly onRouteSelectForBreakdown$ = this.effect((orders$: Observable<any>) =>
    orders$.pipe(
      switchMap((orderArray) =>
        from(orderArray).pipe(
          mergeMap(
            (order: any) => {
              return this.pdfExtractService.getInboutOrderDetails(order.DocumentId, order.Location);
            },
            1000 // <-- concurrency: at most 7 HTTP calls in flight
          ),
          toArray() // gather all the PurchaseOrderDetails into one array
        )
      ),
      tapResponse((allDetails) => {
        const enrichedItems = allDetails.flatMap((detail) =>
          detail.items.map((item: any) => ({
            ...item,
            orderDate: detail.purchaseOrderDate, // <-- new property
          }))
        );
        this.setCurrentRouteOrders(enrichedItems);
      }, this.onError)
    )
  );

  aggregateInboundOrdersByRoute(inboundOrders: { DocumentId: number; Location: string }[]): AggregatedOrders {
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
        acc[key as unknown as RouteKey] = [];
        return acc;
      },
      {} as Record<RouteKey, any[]>
    );

    inboundOrders.forEach((doc) => {
      const locationKey = `${doc.Location}`.trim();

      for (const [routeKey, stores] of Object.entries(moofyToWalmartRoutes)) {
        const foundStore = (stores as any[]).find((store) => store.name === locationKey);

        if (foundStore) {
          result[routeKey as unknown as RouteKey].push(doc);
          break;
        }
      }
    });

    const transformedResult = Object.entries(result)
      .filter(([_, orders]) => orders.length > 0)
      .map(([routeKey, orders]) => ({
        route: routeKey as unknown as RouteKey,
        orders,
      }));

    return transformedResult;
  }

  get onError() {
    return (error: any, component?: any) => this.errorHelperService.handleError(error, component || 'not reported');
  }

  get onSetInboundOrdersSuccess() {
    return (files: any) => this.setInboundOrders(files);
  }

  get onSetInboundOrderDetailsSuccess() {
    return (files: any) => this.setInboundOrderDetails(files);
  }
}
