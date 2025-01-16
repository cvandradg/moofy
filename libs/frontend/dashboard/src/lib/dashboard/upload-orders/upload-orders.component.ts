import { inject, computed, Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatBadgeModule } from '@angular/material/badge';
import { UploadOrdersStore } from './upload-orders.store';
import { Fontawesome, MODULES, moofyPO } from '@moofy-admin/shared';
import { PdfExtractService, moofyToWalmartRoutes } from '@moofy-admin/shared';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RouterModule } from '@angular/router';
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
    PurchaseOrderBreakdownComponent,
  ],
  templateUrl: './upload-orders.component.html',
  styleUrls: ['./upload-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOrdersComponent {
  router = inject(Router);
  readonly pdfExtractService = inject(PdfExtractService);
  readonly uploadOrdersStore = inject(UploadOrdersStore);

  readonly panelOpenState = signal(false);
  favoriteSeason!: string;

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
}
