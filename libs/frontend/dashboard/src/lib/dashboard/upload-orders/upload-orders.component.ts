import * as _ from 'lodash';
import { groupBy } from 'lodash';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatBadgeModule } from '@angular/material/badge';
import { moofyToWalmartRoutes, PurchaseOrder } from '@moofy-admin/shared';
import { Fontawesome, MODULES } from '@moofy-admin/shared';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import {
  collection,
  collectionData,
  CollectionReference,
  Firestore,
  query,
  Timestamp,
  where,
} from '@angular/fire/firestore';
import { PurchaseOrderBreakdownComponent } from './purchase-order-breakdown/purchase-order-breakdown.component';
import { inject, computed, Component, ChangeDetectionStrategy, signal, effect, PLATFORM_ID } from '@angular/core';
import { PrintOrders } from '../print-orders/print-orders';
import { CalendarModule } from 'primeng/calendar';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';

import { IftaLabelModule } from 'primeng/iftalabel';
import { OrdenesEntrantes } from '../ordenes-entrantes/ordenes-entrantes';

@Component({
  selector: 'moofy-upload-orders',
  imports: [
    MODULES,
    PrintOrders,
    Fontawesome,
    RouterModule,
    MatBadgeModule,
    MatInputModule,
    ScrollingModule,
    NgxDropzoneModule,
    MatNativeDateModule,
    IftaLabelModule,
    DatePicker,
    ButtonModule,
    TabsModule,
    DatePickerModule,
    MatDatepickerModule,
    CalendarModule,
    MatBottomSheetModule,
    PurchaseOrderBreakdownComponent,
    OrdenesEntrantes,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './upload-orders.component.html',
  styleUrls: ['./upload-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOrdersComponent {
  router = inject(Router);

  selectedRouteTotal = signal<any>('');
  selectedPurchaseOrder = signal<any>(null);

  firestore = inject(Firestore);
  platformId = inject(PLATFORM_ID);

  readonly todayEndOfDay = signal(this.endOfDay(new Date()));

  startDate = signal<Date>(this.startOfDay(new Date()));
  endDate = signal<Date>(this.endOfDay(new Date()));

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

  fetchInboundDocuments = rxResource<PurchaseOrder[], { start: Timestamp; end: Timestamp }>({
    params: () => ({
      start: Timestamp.fromDate(this.startDate()),
      end: Timestamp.fromDate(this.endDate()),
    }),
    stream: ({ params: { start, end } }) => {
      const q = query(
        collection(this.firestore, 'purchaseOrderDetails2') as CollectionReference<PurchaseOrder>,
        where('createdAtTs', '>=', start),
        where('createdAtTs', '<=', end)
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

  // in your component class
  readonly sortedRoutes = computed(() => {
    const map = this.purchaseOrderByRoutes();
    return this.moofyToWalmartRoutes()
      .slice()
      .sort((a, b) => {
        const emptyA = !map[a]?.length;
        const emptyB = !map[b]?.length;
        if (emptyA === emptyB) {
          return Number(a) - Number(b);
        }
        return emptyA ? 1 : -1;
      });
  });

  trackByOrder(_index: number, order: any) {
    return order.DocumentId;
  }

  endOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  }

  startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }

  allOrdersSortedByRoute = computed(() => {
    const byRoute = this.purchaseOrderByRoutes();
    return Object.entries(byRoute) // [ [routeKey, orders], … ]
      .sort(([a], [b]) => +a - +b) // sort by numeric route
      .flatMap(([, orders]) => orders); // drop the keys, keep orders
  });

  constructor() {
    effect(() => {
      // console.log('flat:', this.allOrdersSortedByRoute());
    });
  }
}
