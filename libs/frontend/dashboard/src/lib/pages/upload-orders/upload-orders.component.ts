import {
  inject,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatBadgeModule } from '@angular/material/badge';
import { UploadOrdersStore } from './upload-orders.store';
import { Fontawesome, MODULES } from '@moofy-admin/shared';
import { provideComponentStore } from '@ngrx/component-store';
import { PdfExtractService, routes } from '@moofy-admin/shared';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { PurchaseOrdersBreakdownComponent } from '../../purchase-orders-breakdown/purchase-orders-breakdown.component';

@Component({
  selector: 'moofy-upload-orders',
  standalone: true,
  imports: [
    MODULES,
    Fontawesome,
    MatBadgeModule,
    NgxDropzoneModule,
    MatBottomSheetModule,
  ],
  providers: [provideComponentStore(UploadOrdersStore)],
  templateUrl: './upload-orders.component.html',
  styleUrls: ['./upload-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOrdersComponent {
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

  openBottomSheet(): void {
    this._bottomSheet.open(PurchaseOrdersBreakdownComponent);
  }

  getSupermarketCount(route: string): number {
    return this.supermarketCountByRoute()[route] || 0;
  }
}
