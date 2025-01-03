import { MatTableModule } from '@angular/material/table';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { provideComponentStore } from '@ngrx/component-store';
import {
  inject,
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { MODULES } from '@moofy-admin/shared';
import { UploadOrdersStore } from '../upload-orders.store';

export interface PeriodicElement {
  name: string;
  quantity: number;
}

@Component({
    selector: 'moofy-processed-orders',
    imports: [CommonModule, MatTableModule, CurrencyPipe, MODULES],
    templateUrl: './processed-orders.component.html',
    styleUrl: './processed-orders.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessedOrdersComponent implements OnInit {
  uploadOrdersStore = inject(UploadOrdersStore);
  displayedColumns: string[] = ['name', 'quantity'];

  ngOnInit(): void {
    this.uploadOrdersStore.totalOfArticlesRequested$.subscribe(
      (totalOfArticlesRequested) => {
        console.log('totalOfArticlesRequested', totalOfArticlesRequested);
      }
    );

    this.uploadOrdersStore.aggregateArticlesPerRoute$.subscribe(
      (aggregateArticlesPerRoute) => {
        console.log('aggregateArticlesPerRoute', aggregateArticlesPerRoute);
      }
    );

    this.uploadOrdersStore.purchaseOrders$.subscribe((purchaseOrders) => {
      console.log('purchaseOrders In processed orders', purchaseOrders);
    });
  }

  getRouteTotal(
    routeValue: { article: string; totalQuantity: number; totalCost: number }[]
  ): number {
    return routeValue.reduce((sum, item) => sum + item.totalQuantity, 0);
  }
}
