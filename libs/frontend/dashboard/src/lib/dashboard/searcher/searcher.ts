import { ChangeDetectionStrategy, Component} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MODULES } from '@moofy-admin/shared';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

interface Item {
  id: number;
  code: string;
  name: string;
  category: string;
}
@Component({
  selector: 'moofy-upload-searcher',
  standalone: true,
imports: [MODULES, FormsModule, TableModule, AutoCompleteModule, InputTextModule],
  templateUrl: './searcher.html',
  styleUrls: ['./searcher.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Searcher {

  private _items: Item[] = [
    { id: 1,  code: 'A100', name: 'Manzana Fuji',     category: 'Fruta'   },
    { id: 2,  code: 'A100', name: 'Manzana Gala',     category: 'Fruta'   },
    { id: 3,  code: 'B200', name: 'Banano Cavendish', category: 'Fruta'   },
    { id: 4,  code: 'B200', name: 'Banano Criollo',   category: 'Fruta'   },
    { id: 5,  code: 'C300', name: 'Zanahoria',        category: 'Vegetal' },
    { id: 6,  code: 'D400', name: 'Lechuga Romana',   category: 'Vegetal' },
    { id: 7,  code: 'C300', name: 'Zanahoria Baby',   category: 'Vegetal' },
    { id: 8,  code: 'E500', name: 'Arroz Integral',   category: 'Grano'   },
    { id: 9,  code: 'E500', name: 'Arroz Jazmín',     category: 'Grano'   },
    { id: 10, code: 'F600', name: 'Avena',            category: 'Cereal'  },
  ];

  searchMode: 'code' | 'category' = 'code';
  query: string | null = null;

  private _suggestions: string[] = [];

  items(): Item[] {
    return this._items;
  }

  suggestions(): string[] {
    return this._suggestions;
  }

filterOptions(e: { query: string }) {
  const q = (e?.query ?? '').toLowerCase().trim();

  if (!q) {
    this._suggestions = [];
    return;
  }

  const s = new Set<string>();
  for (const it of this._items) {
    if (it.id.toString().toLowerCase().includes(q)) s.add(it.id.toString());
    if (it.code.toLowerCase().includes(q))           s.add(it.code);
    if (it.name.toLowerCase().includes(q))           s.add(it.name);
    if (it.category.toLowerCase().includes(q))       s.add(it.category);
  }

  this._suggestions = Array.from(s).slice(0, 50);
}

onOptionSelect(ev: string | { value: string }) {
  const value = typeof ev === 'string' ? ev : (ev?.value ?? this.query ?? '');

  const matches = this._items.filter((it: Item) =>
    it.id.toString() === value ||
    it.code === value ||
    it.name === value ||
    it.category === value
  );

  console.log(`[Seleccionado "${value}"]`, matches);
}

  private allCodesUnique(): string[] {
    const s = new Set<string>();
    for (const it of this._items) s.add(it.code);
    return Array.from(s).sort();
  }

  private allCategoriesUnique(): string[] {
    const s = new Set<string>();
    for (const it of this._items) s.add(it.category);
    return Array.from(s).sort();
  }
}
