import { inject, computed, Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatBadgeModule } from '@angular/material/badge';
import { UploadOrdersStore } from './upload-orders.store';
import { Fontawesome, MODULES, moofyPO } from '@moofy-admin/shared';
import { PdfExtractService, routes } from '@moofy-admin/shared';
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
export class UploadOrdersComponent implements OnInit {
  router = inject(Router);
  readonly pdfExtractService = inject(PdfExtractService);
  readonly uploadOrdersStore = inject(UploadOrdersStore);

  private _bottomSheet = inject(MatBottomSheet);

  readonly panelOpenState = signal(false);
  favoriteSeason!: string;
  seasons: string[] = [
    'SUPERCENTER 100',
    'SUPERCENTER 1354',
    'SUPERCENTER 1334',
    'SUPERCENTER 200',
    'SUPERCENTER 1000',
    'SUPERCENTER 13540',
    'SUPERCENTER 13340',
    'SUPERCENTER 2000',
    'SUPERCENTER 100000',
    'SUPERCENTER 1354000',
    'SUPERCENTER 1334000',
    'SUPERCENTER 2000000',
    'SUPERCENTER 10',
    'SUPERCENTER 13',
    'SUPERCENTER 14',
    'SUPERCENTER 22',
  ];

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

  ngOnInit(): void {
    this.pdfExtractService.walmartBotLogin().subscribe((a: any) => {
      this.pdfExtractService
        .fetchInboundDocuments()
        .subscribe((a: any) => console.log('upload orders fetch inbound documents,', a));

      console.log('login,', a);
    });
  }

  getSupermarketCount(route: string): number {
    return this.supermarketCountByRoute()[route] || 0;
  }

  hasProcessedOrders(purchaseOrders: Record<string, moofyPO[]> | undefined): boolean {
    if (!purchaseOrders) {
      return false; // Handle undefined or null
    }

    return Object.entries(purchaseOrders)
      .filter(([key]) => key !== 'unProcessed') // Exclude 'unProcessed'
      .some(([_, items]) => Array.isArray(items) && items.length); // Check for non-empty arrays
  }
}
