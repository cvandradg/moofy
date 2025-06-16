import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'moofy-purchase-order-details',
  imports: [CommonModule],
  templateUrl: './purchase-order-details.component.html',
  styleUrl: './purchase-order-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderDetailsComponent {}
