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
import { CurrencyPipe } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

interface Transaction {
  item: string;
  cost: number;
}

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Fruit',
    children: [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Fruit loops' }],
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [{ name: 'Broccoli' }, { name: 'Brussels sprouts' }],
      },
      {
        name: 'Orange',
        children: [{ name: 'Pumpkins' }, { name: 'Carrots' }],
      },
    ],
  },
];

@Component({
  selector: 'moofy-purchase-orders-breakdown',
  standalone: true,
  imports: [
    MODULES,
    MatBottomSheetModule,
    MatTableModule,
    CurrencyPipe,
    MatExpansionModule,
    MatTreeModule,
    MatIconModule,
  ],
  templateUrl: './purchase-orders-breakdown.component.html',
  styleUrl: './purchase-orders-breakdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrdersBreakdownComponent {
  readonly panelOpenState = signal(false);
  displayedColumns: string[] = ['item', 'cost'];
  transactions: Transaction[] = [
    { item: 'Beach ball', cost: 4 },
    { item: 'Towel', cost: 5 },
    { item: 'Frisbee', cost: 2 },
    { item: 'Sunscreen', cost: 4 },
    { item: 'Cooler', cost: 25 },
    { item: 'Swim suit', cost: 15 },
  ];

  private _bottomSheetRef =
    inject<MatBottomSheetRef<PurchaseOrdersBreakdownComponent>>(
      MatBottomSheetRef
    );

  dataSource = TREE_DATA;

  childrenAccessor = (node: FoodNode) => node.children ?? [];

  hasChild = (_: number, node: FoodNode) =>
    !!node.children && node.children.length > 0;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { routePurchaseOrders: any }
  ) {}

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
