import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';

type Item = {
  itemNumber: string;
  quantityOrdered: number;
};

@Component({
  selector: 'moofy-upload-searcher',
  standalone: true,
  imports: [FormsModule, TableModule, AutoCompleteModule, InputTextModule],
  templateUrl: './searcher.html',
  styleUrls: ['./searcher.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Searcher {
  readonly purchaseOrders = input<any[]>([]);

  readonly allItems = computed<Item[]>(() => {
    return this.purchaseOrders().flatMap((po) => po.items.filter((x: any) => !x.line.includes('Total')));
  });

  readonly itemNumbers = computed<string[]>(() => {
    const nums = new Set(this.allItems().map((i) => i.itemNumber));
    return Array.from(nums).sort();
  });

  readonly filteredSuggestions = signal<string[]>([]);

  readonly query = signal<string>('');

  readonly visibleItems = computed<Item[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.allItems();
    return this.allItems().filter((i) => i.itemNumber.toLowerCase().includes(q));
  });

  filterOptions(event: AutoCompleteCompleteEvent) {
    const q = (event.query ?? '').toLowerCase().trim();
    const options = this.itemNumbers().filter((num) => num.toLowerCase().includes(q));
    this.filteredSuggestions.set(options);
  }

  onSelect(event: AutoCompleteSelectEvent) {
    this.query.set(String(event.value ?? ''));
  }

onModelChange(value: string | null) {
  const v = (value ?? '').trim();
  if (!v) {
    this.query.set('');
    this.filteredSuggestions.set(this.itemNumbers());
  } else {
    this.query.set(v);
  }
}

  constructor() {
    effect(() => {
      console.log('[Searcher] Items recibidos del padre:', this.allItems());
    });
  }
}
