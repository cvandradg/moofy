import { of, startWith } from 'rxjs';
import * as _ from 'lodash';
import { groupBy } from 'lodash';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { isPlatformBrowser } from '@angular/common';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatBadgeModule } from '@angular/material/badge';
import { moofyToWalmartRoutes } from '@moofy-admin/shared';
import { Fontawesome, MODULES } from '@moofy-admin/shared';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { collection, collectionData, Firestore, query, Timestamp, where } from '@angular/fire/firestore';
import { PurchaseOrderBreakdownComponent } from './purchase-order-breakdown/purchase-order-breakdown.component';
import { inject, computed, Component, ChangeDetectionStrategy, signal, effect, PLATFORM_ID } from '@angular/core';
import { PrintOrders } from '../print-orders/print-orders';
import { FormControl, FormGroup } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';

import { IftaLabelModule } from 'primeng/iftalabel';

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
    DatePickerModule,
    MatDatepickerModule,
    CalendarModule,
    MatBottomSheetModule,
    PurchaseOrderBreakdownComponent,
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

  dateRange2!: Date[];

  firestore = inject(Firestore);
  platformId = inject(PLATFORM_ID);

  dateControl = new FormControl<Date | null>(null);

  range = new FormGroup({
    start: new FormControl<Date>(new Date(), { nonNullable: true }),
    end: new FormControl<Date>(new Date(), { nonNullable: true }),
  });

  dateRange = toSignal(
    this.range.valueChanges.pipe(
      startWith(this.range.value) // emit the current value immediately
    ),
    { initialValue: this.range.value } // and tell toSignal what that initial value is
  );

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
    params: () => this.dateRange(),
    stream: ({ params: { start, end } }) => {
      if (!isPlatformBrowser(this.platformId) || !start || !end) {
        return of<any[]>([]);
      }

      const startTs = Timestamp.fromDate(this.startOfDay(start));
      const endTs = Timestamp.fromDate(this.endOfDay(end));

      console.log('query from', startTs.toDate().toISOString());
      console.log('query to  ', endTs.toDate().toISOString());

      const q = query(
        collection(this.firestore, 'purchaseOrderDetails'),
        where('purchaseOrderDate', '>=', startTs),
        where('purchaseOrderDate', '<=', endTs)
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
      console.log('flat:', this.allOrdersSortedByRoute());
      console.log('date range', this.dateRange());
    });
  }
}
