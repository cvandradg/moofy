import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseOrderDetailsByRouteComponent } from './purchase-order-details-by-route.component';

describe('PurchaseOrderDetailsByRouteComponent', () => {
  let component: PurchaseOrderDetailsByRouteComponent;
  let fixture: ComponentFixture<PurchaseOrderDetailsByRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailsByRouteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderDetailsByRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
