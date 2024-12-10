import {
  inject,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatBadgeModule } from '@angular/material/badge';
import { UploadOrdersStore } from './upload-orders.store';
import { Fontawesome, MODULES, moofyPO } from '@moofy-admin/shared';
import { provideComponentStore } from '@ngrx/component-store';
import { PdfExtractService, routes } from '@moofy-admin/shared';
import {
  MatBottomSheet,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { PurchaseOrdersBreakdownComponent } from '../../purchase-orders-breakdown/purchase-orders-breakdown.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'moofy-upload-orders',
  standalone: true,
  imports: [
    MODULES,
    Fontawesome,
    RouterModule,
    MatBadgeModule,
    NgxDropzoneModule,
    MatBottomSheetModule,
  ],
  templateUrl: './upload-orders.component.html',
  styleUrls: ['./upload-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOrdersComponent {
  router = inject(Router);
  readonly pdfExtractService = inject(PdfExtractService);
  readonly uploadOrdersStore = inject(UploadOrdersStore);

  private _bottomSheet = inject(MatBottomSheet);

  // Derived signal: supermarket counts by route
  /*Creo que se puede simplificar, no hace falta hacer algo tan complejo
  solo para la linea 59 */
  supermarketCountByRoute = computed(() =>
    Object.entries(routes).reduce(
      (acc, [route, supermarkets]) => ({
        ...acc,
        [route]: supermarkets.length,
      }),
      {} as Record<string, number>
    )
  );

  openBottomSheet(routePurchaseOrders: any): void {
    console.log('purchaseOrders', routePurchaseOrders);
    this._bottomSheet.open(PurchaseOrdersBreakdownComponent, {
      data: { routePurchaseOrders },
    });
  }

  getSupermarketCount(route: string): number {
    return this.supermarketCountByRoute()[route] || 0;
  }

  hasProcessedOrders(
    purchaseOrders: Record<string, moofyPO[]> | undefined
  ): boolean {
    if (!purchaseOrders) {
      return false; // Handle undefined or null
    }

    return Object.entries(purchaseOrders)
      .filter(([key]) => key !== 'unProcessed') // Exclude 'unProcessed'
      .some(([_, items]) => Array.isArray(items) && items.length); // Check for non-empty arrays
  }
}
