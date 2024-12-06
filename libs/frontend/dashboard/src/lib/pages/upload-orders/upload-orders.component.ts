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

  // Signals for managing state
  files = signal<File[]>([]);
  extractedPdfOrder = signal<Record<string, any[]>>({});
  moofyToWalmartRoutes: Record<string, { name: string; location: string }[]> = routes;

  // Derived signal: supermarket counts by route
  supermarketCountByRoute = computed(() =>
    Object.entries(this.moofyToWalmartRoutes).reduce(
      (acc, [route, supermarkets]) => ({
        ...acc,
        [route]: supermarkets.length,
      }),
      {} as Record<string, number>
    )
  );

  onSelect(event: any) {
    // Update the files signal
    this.files.set([...this.files(), ...event.addedFiles]);

    // Call the service and update extractedPdfOrder when complete
    this.pdfExtractService.extractOrderByRoute(event.addedFiles).subscribe((newOrders) => {
      this.extractedPdfOrder.update((currentOrders) => ({
        ...currentOrders,
        ...newOrders,
      }));
    });
  }

  onRemove(event: any) {
    this.files.update((files) => files.filter((file) => file !== event));
  }

  getSupermarketCount(route: string): number {
    return this.supermarketCountByRoute()[route] || 0;
  }
}
