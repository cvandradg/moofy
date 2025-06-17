import { of } from 'rxjs';
import * as _ from 'lodash';
import { groupBy } from 'lodash';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { isPlatformBrowser } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatBadgeModule } from '@angular/material/badge';
import { moofyToWalmartRoutes } from '@moofy-admin/shared';
import { Fontawesome, MODULES } from '@moofy-admin/shared';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { collection, collectionData, Firestore, query, where } from '@angular/fire/firestore';
import { PurchaseOrderBreakdownComponent } from './purchase-order-breakdown/purchase-order-breakdown.component';
import { inject, computed, Component, ChangeDetectionStrategy, signal, effect, PLATFORM_ID } from '@angular/core';
import { PrintOrders } from "../print-orders/print-orders";

@Component({
  selector: 'moofy-upload-orders',
  imports: [
    MODULES,
    Fontawesome,
    RouterModule,
    MatBadgeModule,
    MatInputModule,
    ScrollingModule,
    NgxDropzoneModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatBottomSheetModule,
    PurchaseOrderBreakdownComponent,
    PrintOrders
],
  templateUrl: './upload-orders.component.html',
  styleUrls: ['./upload-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOrdersComponent {
  router = inject(Router);

  selectedRouteTotal = signal<any>('');
  selectedPurchaseOrder = signal<any>(null);
  selectedEndDate = signal<Date>(new Date());
  selectedStartDate = signal<Date>(new Date());

  firestore = inject(Firestore);
  platformId = inject(PLATFORM_ID);

  filteredItems = computed(() => {
    const routesMap = this.purchaseOrderByRoutes() ?? {};
    const selectedKey = this.selectedRouteTotal();

    const orders = selectedKey ? (routesMap[selectedKey] ?? []) : Object.values(routesMap).flat();

    return _.chain(orders)
      .flatMap('items')
      .filter((i) => i.quantityOrdered)
      .groupBy('itemNumber')
      .map((group, itemNumber) => ({
        itemNumber,
        quantityOrdered: _.sumBy(group, (i) => Number(i.quantityOrdered)),
      }))
      .value();
  });

  fetchInboundDocuments = rxResource({
    params: () => ({
      start: this.selectedStartDate(),
      end: this.selectedEndDate(),
    }),
    stream: ({ params: { start: startDate, end: endDate } }) => {
      if (!isPlatformBrowser(this.platformId)) {
        return of<any[]>([]);
      }

      console.log('end of day', this.endOfDay(endDate));

      const q = query(
        collection(this.firestore, 'purchaseOrderDetails'),
        where('purchaseOrderDate', '>=', startDate),
        where('purchaseOrderDate', '<=', this.endOfDay(endDate)),
      );

      return collectionData(q, { idField: 'DocumentId' });
    },
    defaultValue: [],
  });

  moofyToWalmartRoutes = computed(() => Object.keys(moofyToWalmartRoutes));

  purchaseOrderByRoutes = computed(() => {
    const locationToRoute = Object.entries(moofyToWalmartRoutes).reduce(
      (acc, [routeKey, stops]) => {
        stops.forEach(({ name }) => {
          acc[name] = Number(routeKey);
        });
        return acc;
      },
      {} as Record<string, number>
    );

    return groupBy(this.fetchInboundDocuments.value(), (el) => locationToRoute[el.location]);
  });

  trackByOrder(_index: number, order: any) {
    return order.DocumentId;
  }

  endOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  }

  constructor() {
    effect(() => {
      console.log('date picker', this.selectedStartDate(), this.selectedEndDate());
    });
  }
}
