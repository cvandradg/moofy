import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { purchaseOrdersStore } from '../../data-access/+stores/purchase-order.store';

@Component({
  selector: 'moofy-purchase-order-details-by-route',
  imports: [CommonModule],
  templateUrl: './purchase-order-details-by-route.component.html',
  styleUrl: './purchase-order-details-by-route.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderDetailsByRouteComponent {
  purchaseOrdersStore = inject(purchaseOrdersStore);
}
