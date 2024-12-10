import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseOrdersBreakdownComponent } from './purchase-orders-breakdown.component';
import { MODULES } from '@moofy-admin/shared';
import {
  MatBottomSheetModule,
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatTableModule } from '@angular/material/table';
import { CurrencyPipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PurchaseOrdersBreakdownComponent', () => {
  let component: PurchaseOrdersBreakdownComponent;
  let fixture: ComponentFixture<PurchaseOrdersBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PurchaseOrdersBreakdownComponent,
        MODULES,
        MatBottomSheetModule,
        MatTableModule,
        CurrencyPipe,
        MatExpansionModule,
        MatTreeModule,
        MatIconModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: MAT_BOTTOM_SHEET_DATA,
          useValue: {
            routePurchaseOrders: [
              { item: 'Test Item 1', cost: 100 },
              { item: 'Test Item 2', cost: 200 },
            ],
          },
        },
        {
          provide: MatBottomSheetRef,
          useValue: {
            dismiss: jest.fn(), // Mock the dismiss method
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrdersBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
