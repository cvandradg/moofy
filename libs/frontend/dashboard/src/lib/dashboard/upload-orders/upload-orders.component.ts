import * as _ from 'lodash';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatInputModule } from '@angular/material/input';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatBadgeModule } from '@angular/material/badge';
import { purchaseOrdersStore } from '@moofy-admin/shared';
import { Fontawesome, MODULES } from '@moofy-admin/shared';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { inject, computed, Component, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { PurchaseOrderBreakdownComponent } from './purchase-order-breakdown/purchase-order-breakdown.component';

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
    ScrollingModule,
    MatNativeDateModule,
    PurchaseOrderBreakdownComponent,
  ],
  templateUrl: './upload-orders.component.html',
  styleUrls: ['./upload-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOrdersComponent {
  router = inject(Router);

  selectedRouteTotal = signal<any>('');
  selectedPurchaseOrder = signal<any>(null);
  selectedEndDate = signal<Date | null>(null);
  selectedStartDate = signal<Date | null>(null);
  purchaseOrdersStore = inject(purchaseOrdersStore);

  filteredItems = computed(() => {
    console.log('llama al computed filteredItems');

    const routesMap = this.purchaseOrdersStore.purchaseOrderByRoutes() ?? {};
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

  trackByOrder(_index: number, order: any) {
    return order.DocumentId;
  }

  constructor() {
    effect(() => {
      console.log('filteredItems:', this.filteredItems());
    });
  }
}
