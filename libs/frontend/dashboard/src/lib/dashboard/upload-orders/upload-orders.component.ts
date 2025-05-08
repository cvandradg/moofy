import * as _ from 'lodash';
import { inject, computed, Component, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatBadgeModule } from '@angular/material/badge';
import { UploadOrdersStore } from './upload-orders.store';
import { Fontawesome, MODULES } from '@moofy-admin/shared';
import { moofyToWalmartRoutes } from '@moofy-admin/shared';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RouterModule } from '@angular/router';
import { PurchaseOrderBreakdownComponent } from './purchase-order-breakdown/purchase-order-breakdown.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';



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

@Component({
  selector: 'moofy-upload-orders',
  imports: [
    MODULES,
    Fontawesome,
    RouterModule,
    MatBadgeModule,
    NgxDropzoneModule,
    MatBottomSheetModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    PurchaseOrderBreakdownComponent,
  ],
  templateUrl: './upload-orders.component.html',
  styleUrls: ['./upload-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOrdersComponent {
  router = inject(Router);

  selectedStartDate = signal<Date | null>(null);
  selectedEndDate = signal<Date | null>(null);

  readonly uploadOrdersStore = inject(UploadOrdersStore);

  readonly selectedInboundOrder = signal<inboundOrder>({} as inboundOrder);

  moofyToWalmartRoutes = moofyToWalmartRoutes;

  // Derived signal: supermarket counts by route
  /*Creo que se puede simplificar, no hace falta hacer algo tan complejo
  solo para la linea 59 */
  supermarketCountByRoute = computed(() =>
    Object.entries(moofyToWalmartRoutes).reduce(
      (acc, [route, supermarkets]) => ({
        ...acc,
        [route]: supermarkets.length,
      }),
      {} as Record<string, number>
    )
  );

  formattedStartDate = computed(() => {
    const date = this.selectedStartDate();
    if (!date) return '';

    const month = date.getMonth() + 1;  // JS months are 0-indexed
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  });

  formattedEndDate = computed(() => {
    const date = this.selectedEndDate();
    if (!date) return '';

    const month = date.getMonth() + 1;  // JS months are 0-indexed
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  });

  readonly allOrders = toSignal(this.uploadOrdersStore.currentRouteOrders$, { initialValue: [] });

  readonly filteredOrders = computed(() => {
    const orders = this.allOrders();
    const start = this.selectedStartDate();
    const end = this.selectedEndDate();

    if (!start && !end) return this.routesArticlesGroups(orders);

    const filtered = orders.filter(order => {
      if (!order.purchaseOrderDate) return false;
      const [month, day, year] = order.purchaseOrderDate.split('/').map(Number);
      const orderDate = new Date(year, month - 1, day);

      if (start && end) {
        return orderDate >= start && orderDate <= end;
      } else if (start) {
        return orderDate >= start;
      } else if (end) {
        return orderDate <= end;
      }
      return true;
    });

    return this.routesArticlesGroups(filtered);
  });




  constructor() {
    effect(() => {
      console.log('Selected date:', this.formattedStartDate());
    })
  }



  onInboundOrderSelected(selectedOrder: any): void {
    this.selectedInboundOrder.set(selectedOrder); // Update the signal with the selected order
  }

  routesArticlesGroups(currentRouteOrders: any[]) {
    if (!currentRouteOrders?.length) return [];

    // Flatten all items from all orders
    const allItems = currentRouteOrders.flatMap(order => order.items ?? []);

    // Group by itemNumber
    const buckets = _.groupBy(allItems, 'itemNumber');

    // Sum quantities
    return Object.entries(buckets).map(([itemNumber, items]) => ({
      itemNumber,
      quantityOrdered: _.sumBy(items, item => Number(item.quantityOrdered ?? 0))
    }));
  }

}
