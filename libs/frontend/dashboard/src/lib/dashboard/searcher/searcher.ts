import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MODULES } from '@moofy-admin/shared';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

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
    { code: 'A100', name: 'Manzana Fuji',     ruta: 'Fruta'   },
    { code: 'A100', name: 'Manzana Gala',     ruta: 'Fruta'   },
    { code: 'B200', name: 'Banano Cavendish', ruta: 'Fruta'   },
    { code: 'B200', name: 'Banano Criollo',   ruta: 'Fruta'   },
    { code: 'C300', name: 'Zanahoria',        ruta: 'Vegetal' },
    { code: 'D400', name: 'Lechuga Romana',   ruta: 'Vegetal' },
    { code: 'C300', name: 'Zanahoria Baby',   ruta: 'Vegetal' },
    { code: 'E500', name: 'Arroz Integral',   ruta: 'Grano'   },
    { code: 'E500', name: 'Arroz Jazmín',     ruta: 'Grano'   },
    { code: 'F600', name: 'Avena',            ruta: 'Cereal'  },
  ]);

  searchMode: 'code' | 'ruta' | 'name' = 'code';
  query: string | null = null;
  readonly querySignal = signal<string>('');

  readonly uniqueCodes = computed<string[]>(() => {
    const set = new Set(this.items().map(i => i.code));
    return Array.from(set).sort();
  });

  readonly uniqueRutas = computed<string[]>(() => {
    const set = new Set(this.items().map(i => i.ruta));
    return Array.from(set).sort();
  });

  readonly uniqueNames = computed<string[]>(() => {
    const set = new Set(this.items().map(i => i.name));
    return Array.from(set).sort();
  });

  readonly combinedOptions = computed<string[]>(() => {
    const codes = this.uniqueCodes().map(v => `code: ${v}`);
    const names = this.uniqueNames().map(v => `name: ${v}`);
    const rutas = this.uniqueRutas().map(v => `ruta: ${v}`);
    return [...codes, ...names, ...rutas];
  });

  readonly suggestions = computed(() => {
    const q = this.querySignal().toLowerCase().trim();
    const all = this.combinedOptions();
    const filtered = q ? all.filter(s => s.toLowerCase().includes(q)) : all;
    return filtered.slice(0, 50);
  });

  filterOptions(event: { query: string }): void {
    this.querySignal.set(event?.query ?? '');
  }

  onOptionSelect(event: string | { value?: string } | null): void {
    const raw = typeof event === 'string' ? event : (event?.value ?? this.query ?? '');
    const [maybeField, ...rest] = raw.split(':');
    const value = rest.join(':').trim();
    const key = (maybeField ?? '').trim().toLowerCase();

    const field: 'code' | 'name' | 'ruta' | null =
      key === 'code' || key === 'name' || key === 'ruta' ? (key as 'code' | 'name' | 'ruta') : null;

    const effectiveField = field ?? this.searchMode;

    const matches = this.items().filter(item => {
      switch (effectiveField) {
        case 'code': return item.code === value;
        case 'ruta': return item.ruta === value;
        default:     return item.name === value;
      }
    });

    console.log(`[Seleccionado ${effectiveField}="${value}"]`, matches);
  }
}
