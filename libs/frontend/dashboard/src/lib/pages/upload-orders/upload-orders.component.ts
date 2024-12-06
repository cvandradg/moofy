import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
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
  styleUrls: ['./upload-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOrdersComponent {
  pdfExtractService = inject(PdfExtractService);

  files = signal<File[]>([]);
  extractedPdfOrder = signal<Record<string, any[]>>({});
  moofyToWalmartRoutes: Record<string, { name: string; location: string }[]> = routes;

  // Computed to derive route-specific supermarket counts
  getSupermarketAmountByRoute = computed(() => {
    return Object.keys(this.moofyToWalmartRoutes).reduce(
      (acc, route) => ({
        ...acc,
        [route]: this.moofyToWalmartRoutes[route]?.length || 0,
      }),
      {} as Record<string, number>
    );
  });

  onSelect(event: any) {
    const newFiles = [...this.files(), ...event.addedFiles];
    this.files.set(newFiles);

    this.pdfExtractService.extractOrderByRoute(event.addedFiles).subscribe((newOrders) => {
      this.extractedPdfOrder.set({
        ...this.extractedPdfOrder(),
        ...newOrders,
      });
    });
  }

  onRemove(event: any) {
    this.files.update((files) => files.filter((file) => file !== event));
  }

  getSupermarketCount(route: string): number {
    return this.getSupermarketAmountByRoute()[route] || 0;
  }
}
