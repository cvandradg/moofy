import { MatTableModule } from '@angular/material/table';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { provideComponentStore } from '@ngrx/component-store';
import { UploadOrdersStore } from '../upload-orders/upload-orders.store';
import {
  inject,
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { MODULES } from '@moofy-admin/shared';

export interface PeriodicElement {
  name: string;
  quantity: number;
}

@Component({
  selector: 'moofy-processed-orders',
  standalone: true,
  imports: [CommonModule, MatTableModule, CurrencyPipe, MODULES],
  templateUrl: './processed-orders.component.html',
  styleUrl: './processed-orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessedOrdersComponent implements OnInit {
  uploadOrdersStore = inject(UploadOrdersStore);
  displayedColumns: string[] = ['name', 'quantity'];
  
  ngOnInit(): void {
    this.uploadOrdersStore.totalOfArticlesRequested$.subscribe(
      (articlesByRoute) => {
        console.log('articlesByRoute', articlesByRoute);
      }
    );

    this.uploadOrdersStore.aggregateArticlesPerRoute$.subscribe(
      (aggregateArticlesPerRoute) => {
        console.log('articlesByRoute', aggregateArticlesPerRoute);
      }
    );
  }

  getRouteTotal(routeValue: { article: string; totalQuantity: number; totalCost: number }[]): number {
    return routeValue.reduce((sum, item) => sum + item.totalQuantity, 0);
  }
}
