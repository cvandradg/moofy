import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseOrderBreakdownComponent } from './purchase-order-breakdown.component';

describe('PurchaseOrderBreakdownComponent', () => {
  let component: PurchaseOrderBreakdownComponent;
  let fixture: ComponentFixture<PurchaseOrderBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderBreakdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
