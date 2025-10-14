import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MODULES } from '@moofy-admin/shared';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import type { AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';

type Item = {
  code: string;
  name: string;
  ruta: string;
};

@Component({
  selector: 'moofy-upload-searcher',
  standalone: true,
  imports: [MODULES, FormsModule, TableModule, AutoCompleteModule, InputTextModule],
  templateUrl: './searcher.html',
  styleUrls: ['./searcher.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Searcher {
  readonly items = signal<Item[]>([
    { code: 'A100', name: 'Manzana Fuji', ruta: 'Fruta' },
    { code: 'A100', name: 'Manzana Gala', ruta: 'Fruta' },
    { code: 'B200', name: 'Banano Cavendish', ruta: 'Fruta' },
    { code: 'B200', name: 'Banano Criollo', ruta: 'Fruta' },
    { code: 'C300', name: 'Zanahoria', ruta: 'Vegetal' },
    { code: 'D400', name: 'Lechuga Romana', ruta: 'Vegetal' },
    { code: 'C300', name: 'Zanahoria Baby', ruta: 'Vegetal' },
    { code: 'E500', name: 'Arroz Integral', ruta: 'Grano' },
    { code: 'E500', name: 'Arroz Jazmín', ruta: 'Grano' },
    { code: 'F600', name: 'Avena', ruta: 'Cereal' },
  ]);

  searchMode: 'code' | 'ruta' | 'name' = 'code';

  query: string | null = null;

  readonly filteredOptions = signal<string[]>([]);

  readonly filterState = signal<{ field: 'code' | 'name' | 'ruta'; value: string } | null>(null);

  readonly visibleItems = computed<Item[]>(() => {
    const f = this.filterState();
    if (!f) return this.items();
    return this.items().filter((item) => item[f.field] === f.value);
  });

  readonly uniqueCodes = computed<string[]>(() => {
    const set = new Set(this.items().map((i) => i.code));
    return Array.from(set).sort();
  });

  readonly uniqueRutas = computed<string[]>(() => {
    const set = new Set(this.items().map((i) => i.ruta));
    return Array.from(set).sort();
  });

  readonly uniqueNames = computed<string[]>(() => {
    const set = new Set(this.items().map((i) => i.name));
    return Array.from(set).sort();
  });

  readonly combinedOptions = computed<string[]>(() => {
    const codes = this.uniqueCodes().map((v) => `code: ${v}`);
    const names = this.uniqueNames().map((v) => `name: ${v}`);
    const rutas = this.uniqueRutas().map((v) => `ruta: ${v}`);
    return [...codes, ...names, ...rutas];
  });

  filterOptions({ query }: AutoCompleteCompleteEvent): void {
    const q = (query ?? '').toLowerCase().trim();
    const all = this.combinedOptions();
    const next = q ? all.filter((s) => s.toLowerCase().includes(q)) : all;
    this.filteredOptions.set(next.slice(0, 50));
  }

  onOptionSelect(event: AutoCompleteSelectEvent | { value?: string } | string | null): void {
    const raw =
      typeof event === 'string'
        ? event
        : ((event as AutoCompleteSelectEvent | { value?: string })?.value ?? this.query ?? '');

    const [maybeField, ...rest] = String(raw).split(':');
    const key = (maybeField ?? '').trim().toLowerCase();
    const valueOnly = rest.join(':').trim();

    const field: 'code' | 'name' | 'ruta' | null =
      key === 'code' || key === 'name' || key === 'ruta' ? (key as 'code' | 'name' | 'ruta') : null;

    const effectiveField = field ?? this.searchMode;

    this.filterState.set(valueOnly ? { field: effectiveField, value: valueOnly } : null);

    this.query = valueOnly ? `${effectiveField}: ${valueOnly}` : '';
  }

  onModelChange(val: string | null): void {
    if (!val) {
      this.filterState.set(null);
      this.filteredOptions.set(this.combinedOptions());
    }
  }
}
