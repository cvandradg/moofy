import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AutoCompleteModule, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { Fontawesome } from '@moofy-admin/shared';

type Item = { itemNumber: string; quantityOrdered: number };

@Component({
  selector: 'moofy-upload-searcher',
  standalone: true,
  imports: [FormsModule, TableModule, AutoCompleteModule, InputTextModule, Fontawesome],
  templateUrl: './searcher.html',
  styleUrls: ['./searcher.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Searcher {
  readonly sortedRoutes = input<(string | number)[]>([]);
  readonly purchaseOrders = input<any[]>([]);
  readonly purchaseOrderByRoutes = input<Record<string | number, any[]>>({} as any);

  readonly query = signal<string>('');

  readonly allItems = computed<Item[]>(() =>
    (this.purchaseOrders() ?? []).flatMap((po) =>
      (po?.items ?? []).filter((x: any) => !String(x?.line ?? '').includes('Total'))
    )
  );

  readonly itemNumbers = computed<string[]>(() => {
    const nums = new Set((this.allItems() ?? []).map((i) => String(i.itemNumber ?? '')));
    return Array.from(nums)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  });

  readonly filteredSuggestions = signal<string[]>([]);

  readonly itemsByRoute = computed<Record<string | number, Item[]>>(() => {
    const byRoute = this.purchaseOrderByRoutes() ?? {};
    const out: Record<string | number, Item[]> = {};

    for (const [routeKey, pos] of Object.entries(byRoute)) {
      out[routeKey] =
        (pos as any[])?.flatMap((po: any) => {
          const loc = String(po?.location ?? ''); // take location from the PO
          return (po?.items ?? [])
            .filter((x: any) => !String(x?.line ?? '').includes('Total'))
            .map((x: any) => ({
              itemNumber: String(x.itemNumber ?? ''),
              quantityOrdered: Number(x.quantityOrdered ?? 0),
              location: loc, // attach it per row
            }));
        }) ?? [];
    }

    return out;
  });

  readonly filteredItemsByRoute = computed<Record<string | number, Item[]>>(() => {
    const q = this.query().trim().toLowerCase();
    const base = this.itemsByRoute();
    if (!q) return base;

    const out: Record<string | number, Item[]> = {};
    for (const [routeKey, items] of Object.entries(base)) {
      out[routeKey] = items.filter((i) =>
        String(i?.itemNumber ?? '')
          .toLowerCase()
          .includes(q)
      );
    }
    return out;
  });

  filterOptions(event: AutoCompleteCompleteEvent) {
    const q = String(event?.query ?? '')
      .toLowerCase()
      .trim();
    this.filteredSuggestions.set(this.itemNumbers().filter((num) => num.toLowerCase().includes(q)));
  }

  onSelect(event: AutoCompleteSelectEvent) {
    this.query.set(String(event?.value ?? ''));
  }

  onModelChange(value: string | null) {
    const v = String(value ?? '').trim();
    this.query.set(v);
    const lower = v.toLowerCase();
    this.filteredSuggestions.set(
      v ? this.itemNumbers().filter((n) => n.toLowerCase().includes(lower)) : this.itemNumbers()
    );
  }

  constructor() {
    effect(() => {
      console.log('purchaseOrders()', this.purchaseOrders())
      console.log('sortedRoutes()', this.sortedRoutes())
      console.log('purchaseOrderByRoutes()', this.purchaseOrderByRoutes())
    });
  }
}

