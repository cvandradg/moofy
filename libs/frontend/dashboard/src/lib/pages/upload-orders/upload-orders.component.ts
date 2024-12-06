import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatBadgeModule } from '@angular/material/badge';
import { Fontawesome, MODULES } from '@moofy-admin/shared';
import { PdfExtractService, routes } from '@moofy-admin/shared';

@Component({
  selector: 'moofy-upload-orders',
  standalone: true,
  imports: [MODULES, Fontawesome, MatBadgeModule, NgxDropzoneModule],
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
  ) {}

  async onSelect(event: any) {
    this.files.push(...event.addedFiles);

    const newOrders = await this.pdfExtractService.extractOrderByRoute(
      event.addedFiles
    );

    this.extractedPdfOrder = { ...this.extractedPdfOrder, ...newOrders };

    this.ref.detectChanges();
  }

  getSupermarketAmountByRoute(route: any): number {
    const a: keyof typeof this.moofyToWalmartRoutes = route;
    return this.moofyToWalmartRoutes[a].length;
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }
}
