import { of } from 'rxjs';
import { MODULES } from '@moofy-admin/shared';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { UploadOrdersStore } from '../upload-orders.store';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessedOrdersComponent } from './processed-orders.component';

describe('ProcessedOrdersComponent', () => {
  let component: ProcessedOrdersComponent;
  let fixture: ComponentFixture<ProcessedOrdersComponent>;

  const pdfExtractService = {
    totalOfArticlesRequested$: of(true),
    aggregateArticlesPerRoute$: of(true),
    purchaseOrders$: of(true),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MODULES,
        CommonModule,
        MatTableModule,
        ProcessedOrdersComponent,
      ],
      providers: [{ provide: UploadOrdersStore, useValue: pdfExtractService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessedOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
