import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrintOrders } from './print-orders';

describe('PrintOrders', () => {
  let component: PrintOrders;
  let fixture: ComponentFixture<PrintOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintOrders],
    }).compileComponents();

    fixture = TestBed.createComponent(PrintOrders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
