import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseOrderTotalsOverviewComponent } from './purchase-order-totals-overview.component';

describe('PurchaseOrderTotalsOverviewComponent', () => {
  let component: PurchaseOrderTotalsOverviewComponent;
  let fixture: ComponentFixture<PurchaseOrderTotalsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderTotalsOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderTotalsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
