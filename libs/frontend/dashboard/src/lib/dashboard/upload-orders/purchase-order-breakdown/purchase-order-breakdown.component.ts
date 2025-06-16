import { MODULES } from '@moofy-admin/shared';
import { ChangeDetectionStrategy, Component, computed, effect, Input, Signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';

@Component({
  selector: 'moofy-purchase-order-breakdown',
  imports: [MODULES, MatTableModule],
  templateUrl: './purchase-order-breakdown.component.html',
  styleUrl: './purchase-order-breakdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderBreakdownComponent {
  @Input({ required: true }) purchaseOrderDetails$!: Signal<any>;

  displayedColumns: string[] = ['name', 'quantity'];


filteredItems = computed(() =>
{

  return {...this.purchaseOrderDetails$(), items: this.purchaseOrderDetails$().items.filter((item: any) => item.quantityOrdered)};

})
  

constructor() {
  effect(() => {
    console.log('Filtered Items:', this.filteredItems());
  })
}
}
