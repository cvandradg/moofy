import { MODULES } from '@moofy-admin/shared';
import {
  MatBottomSheetRef,
  MatBottomSheetModule,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import {
  Inject,
  inject,
  Component,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'moofy-purchase-orders-breakdown',
  imports: [
    MODULES,
    MatTreeModule,
    MatIconModule,
    MatTableModule,
    MatExpansionModule,
    MatBottomSheetModule,
  ],
  templateUrl: './purchase-orders-breakdown.component.html',
  styleUrl: './purchase-orders-breakdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrdersBreakdownComponent {
  readonly panelOpenState = signal(false);
  displayedColumns: string[] = ['item', 'cost'];

  private _bottomSheetRef =
    inject<MatBottomSheetRef<PurchaseOrdersBreakdownComponent>>(
      MatBottomSheetRef
    );

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { routePurchaseOrders: any }
  ) {}

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
