import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessedOrdersComponent } from './processed-orders.component';
import { MODULES } from '@moofy-admin/shared';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { of } from 'rxjs';
import { UploadOrdersStore } from '../upload-orders.store';

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
        ProcessedOrdersComponent,
        CommonModule,
        MatTableModule,
        CurrencyPipe,
        MODULES,
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
