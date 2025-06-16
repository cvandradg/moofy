import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseOrderBreakdownComponent } from './purchase-order-breakdown.component';
import { signal, Signal } from '@angular/core';

describe('PurchaseOrderBreakdownComponent', () => {
  let component: PurchaseOrderBreakdownComponent;
  let fixture: ComponentFixture<PurchaseOrderBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderBreakdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderBreakdownComponent);
    component = fixture.componentInstance;

    // ← MOCK the @Input() before change detection
    component.purchaseOrderDetails$ = signal<{ items: any[] }>({
      items: [
        { name: 'foo', quantityOrdered: 2 },
        { name: 'bar', quantityOrdered: 0 },
      ],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter out items with no quantityOrdered', () => {
    const filtered = component.filteredItems();
    expect(filtered.items.length).toBe(1);
    expect(filtered.items[0].name).toBe('foo');
  });
});
