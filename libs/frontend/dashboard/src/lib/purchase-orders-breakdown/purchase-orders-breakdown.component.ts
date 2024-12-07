import { MODULES } from '@moofy-admin/shared';
import {
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UploadOrdersComponent } from '../pages/upload-orders/upload-orders.component';

@Component({
  selector: 'moofy-purchase-orders-breakdown',
  standalone: true,
  imports: [MODULES, MatBottomSheetModule],
  providers: [],
  templateUrl: './purchase-orders-breakdown.component.html',
  styleUrl: './purchase-orders-breakdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrdersBreakdownComponent {
  private _bottomSheetRef =
    inject<MatBottomSheetRef<PurchaseOrdersBreakdownComponent>>(
      MatBottomSheetRef
    );

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
