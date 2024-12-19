import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadOrdersComponent } from './upload-orders.component';
import { of } from 'rxjs';
import { Fontawesome, MODULES, PdfExtractService } from '@moofy-admin/shared';
import { UploadOrdersStore } from './upload-orders.store';
import { RouterModule } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('UploadOrdersComponent', () => {
  let component: UploadOrdersComponent;
  let fixture: ComponentFixture<UploadOrdersComponent>;

  const pdfExtractService = {
    walmartBotLogin: jest.fn().mockReturnValue(of(true)),
    fetchInboundDocuments: jest.fn().mockReturnValue(of(true)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UploadOrdersComponent,
        MODULES,
        Fontawesome,
        RouterModule,
        MatBadgeModule,
        NgxDropzoneModule,
        MatBottomSheetModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: PdfExtractService, useValue: pdfExtractService },
        { provide: UploadOrdersStore, useValue: pdfExtractService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
