import { InboundDocument } from '@moofy-admin/shared';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { collection, collectionData, CollectionReference, Firestore, query } from '@angular/fire/firestore';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';

@Component({
  selector: 'moofy-ordenes-entrantes',
  imports: [MatExpansionModule],
  templateUrl: './ordenes-entrantes.html',
  styleUrl: './ordenes-entrantes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdenesEntrantes {
  firestore = inject(Firestore);
  readonly panelOpenState = signal(false);

  fetchInboundDocuments = rxResource<any, InboundDocument[]>({
    stream: () => {
      const coll = collection(this.firestore, 'inboundOrders') as CollectionReference<InboundDocument>;

      const q = query(coll);
      return collectionData<InboundDocument>(q, {
        idField: 'DocumentId',
      });
    },
    defaultValue: [] as InboundDocument[],
  });

  groupedBy3h = computed<InboundDocument[][]>(() => {
    const docs = this.fetchInboundDocuments.value();
    const THREE_HOURS = 3 * 60 * 60 * 1_000;

    const groups = this.groupByTimeGap<InboundDocument>(docs, (d) => d.createdAtTs.toMillis(), THREE_HOURS);

    const itemsNewestFirst = groups.map((g) => [...g].reverse());

    return itemsNewestFirst.reverse();
  });

  constructor() {
    effect(() => {
      console.log('orders arranged:', this.groupedBy3h());
    });
  }

  groupByTimeGap<T>(items: T[], getTime: (item: T) => number, maxGapMs: number): T[][] {
    const sorted = [...items].sort((a, b) => getTime(a) - getTime(b));
    const groups: T[][] = [];
    let currentGroup: T[] = [];

    for (const item of sorted) {
      const ts = getTime(item);
      const last = currentGroup[currentGroup.length - 1];
      const gap = last ? ts - getTime(last) : 0;

      if (last && gap >= maxGapMs) {
        groups.push(currentGroup);
        currentGroup = [];
      }

      currentGroup.push(item);
    }

    if (currentGroup.length) {
      groups.push(currentGroup);
    }

    return groups;
  }

  readonly spanishFormatter = new Intl.DateTimeFormat('es-CR', {
    weekday: 'long', // “jueves”
    day: 'numeric', // “15”
    month: 'numeric', // “7”
    year: 'numeric', // “2015”
    hour: '2-digit', // “14”
    minute: '2-digit', // “00”
    hour12: false, // 24‑hour mode
    hourCycle: 'h23',
  });
}
