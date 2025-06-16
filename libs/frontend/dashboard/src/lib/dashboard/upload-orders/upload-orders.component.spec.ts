import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { Firestore } from '@angular/fire/firestore';
import { MatBadgeModule } from '@angular/material/badge';
import { UploadOrdersStore } from './upload-orders.store';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadOrdersComponent } from './upload-orders.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Fontawesome, MODULES, PdfExtractService, purchaseOrdersStore } from '@moofy-admin/shared';

describe('UploadOrdersComponent', () => {
  let component: UploadOrdersComponent;
  let fixture: ComponentFixture<UploadOrdersComponent>;

  const pdfExtractService = {
    fetchInboundDocuments: jest.fn().mockReturnValue(of(true)),
  };

  const purchaseOrdersStoreMock = {
    fetchInboundDocuments: {
      isLoading: jest.fn(() => false),
    },
    moofyToWalmartRoutes: jest.fn(() => ['A']),
    purchaseOrderByRoutes: jest.fn(() => ({
      A: [
        {
          items: [
            {
              itemNumber: '123',
              quantityOrdered: 5,
              location: '1001',
              DocumentId: 'order-123',
            },
          ],
        },
      ],
    })),
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
        { provide: purchaseOrdersStore, useValue: purchaseOrdersStoreMock },
        { provide: Firestore, useValue: {} },
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
