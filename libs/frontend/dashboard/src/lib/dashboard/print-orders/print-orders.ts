import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Fontawesome, MODULES, PrintOrdersService } from '@moofy-admin/shared';


@Component({
  selector: 'moofy-print-orders',
  templateUrl: './print-orders.html',
  styleUrl: './print-orders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MODULES, Fontawesome],
})
export class PrintOrders {

  url = signal('https://storage.googleapis.com/purchase-orders-screenshots/purchase-orders/po-82338129.png')

  purchaseOrders = input.required<any[]>();

  printOrdersService = inject(PrintOrdersService);
}
