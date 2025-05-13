import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'moofy-purchase-order-totals-overview',
  imports: [CommonModule],
  templateUrl: './purchase-order-totals-overview.component.html',
  styleUrl: './purchase-order-totals-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderTotalsOverviewComponent {}
