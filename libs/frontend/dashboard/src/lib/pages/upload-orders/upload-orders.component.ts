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
import { provideComponentStore } from '@ngrx/component-store';
import { UploadOrdersStore } from './upload-orders.store';

@Component({
  selector: 'moofy-upload-orders',
  standalone: true,
  imports: [MODULES, Fontawesome, MatBadgeModule, NgxDropzoneModule],
  providers: [provideComponentStore(UploadOrdersStore)],
  templateUrl: './upload-orders.component.html',
  styleUrls: ['./upload-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOrdersComponent {
  readonly pdfExtractService = inject(PdfExtractService);
  readonly uploadOrdersStore = inject(UploadOrdersStore);

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

  getSupermarketCount(route: string): number {
    return this.supermarketCountByRoute()[route] || 0;
  }
}
