import { NgxDropzoneModule } from 'ngx-dropzone';
import { PdfExtractService } from '@moofy-admin/shared';
import { Fontawesome, MODULES } from '@moofy-admin/shared';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { RoutesTableComponent } from '../../routes-table/routes-table.component';

@Component({
  selector: 'moofy-upload-orders',
  standalone: true,
  imports: [MODULES, Fontawesome, NgxDropzoneModule, RoutesTableComponent],
  templateUrl: './upload-orders.component.html',
  styleUrl: './upload-orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOrdersComponent {
  files: File[] = [];
  extractedPdfOrder: any = [];

  constructor(
    private pdfExtractService: PdfExtractService,
    private ref: ChangeDetectorRef
  ) {}

  async onSelect(event: any) {
    console.log(event);
    this.files.push(...event.addedFiles);

    for (let i = 0; i < event.addedFiles.length; i++) {
      if (event.addedFiles[i]) {
        const purchaseOrder = await this.pdfExtractService.extractTextFromPdf(
          event.addedFiles[i]
        );

        this.extractedPdfOrder.push(purchaseOrder);
        this.ref.detectChanges();
        console.log('upload component ', this.extractedPdfOrder);
      }
    }
  }

  onRemove(event: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
}
