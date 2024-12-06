import { NgxDropzoneModule } from 'ngx-dropzone';
import { PdfExtractService, routes } from '@moofy-admin/shared';
import { Fontawesome, MODULES } from '@moofy-admin/shared';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { RoutesTableComponent } from '../../routes-table/routes-table.component';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'moofy-upload-orders',
  standalone: true,
  imports: [
    MODULES,
    Fontawesome,
    NgxDropzoneModule,
    RoutesTableComponent,
    MatBadgeModule,
  ],
  templateUrl: './upload-orders.component.html',
  styleUrl: './upload-orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOrdersComponent {
  files: File[] = [];
  extractedPdfOrder: Record<string, any[]> = {};
  moofyToWalmartRoutes = routes;

  constructor(
    private pdfExtractService: PdfExtractService,
    private ref: ChangeDetectorRef
  ) {
    console.log('ROUTES,', this.moofyToWalmartRoutes);
  }

  async onSelect(event: any) {
    console.log(event);
    this.files.push(...event.addedFiles);

    const newOrders = await this.pdfExtractService.extractOrderByRoute(
      event.addedFiles
    );

    this.extractedPdfOrder = { ...this.extractedPdfOrder, ...newOrders };

    console.log(this.extractedPdfOrder);

    this.ref.detectChanges();

    // for (let i = 0; i < event.addedFiles.length; i++) {
    //   if (event.addedFiles[i]) {
    //     const purchaseOrder = await this.pdfExtractService.extractTextFromPdf(
    //       event.addedFiles[i]
    //     );

    //     this.extractedPdfOrder.push(purchaseOrder);
    //     console.log('upload component ', this.extractedPdfOrder);
    //   }
    // }
  }

  getSupermarketAmountByRoute(route: any): number {
    const a: keyof typeof this.moofyToWalmartRoutes = route;
    return this.moofyToWalmartRoutes[a].length;
  }

  onRemove(event: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
}
