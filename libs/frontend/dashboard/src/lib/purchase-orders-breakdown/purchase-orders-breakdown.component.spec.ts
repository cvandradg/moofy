import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseOrdersBreakdownComponent } from './purchase-orders-breakdown.component';

describe('PurchaseOrdersBreakdownComponent', () => {
  let component: PurchaseOrdersBreakdownComponent;
  let fixture: ComponentFixture<PurchaseOrdersBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrdersBreakdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrdersBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
