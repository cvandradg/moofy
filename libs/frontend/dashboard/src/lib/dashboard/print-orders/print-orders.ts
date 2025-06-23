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
  purchaseOrders = input.required<any[]>();

  printOrdersService = inject(PrintOrdersService);
}
