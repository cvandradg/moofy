import { of } from 'rxjs';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { signalStoreFeature, withProps } from '@ngrx/signals';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

export function withMoofyPurchaseOrders() {
  return signalStoreFeature(
    withProps((store, firestore = inject(Firestore), platformId = inject(PLATFORM_ID)) => ({
      fetchInboundDocuments: rxResource({
        stream: () => {
          if (!isPlatformBrowser(platformId)) {
            return of<any[]>([]);
          }
          const podRef = collection(firestore, 'purchaseOrderDetails');
          return collectionData(podRef, { idField: 'DocumentId' });
        },
        defaultValue: [],
      }),
    }))
  );
}
// purchaseOrdersDetails: rxResource({
//   stream: () => {
//     const itemsRef = collection(firestore, 'purchaseOrderDetails');
//     return collectionData(itemsRef, { idField: 'id' });
//   },
// }),
/*
      mergeResource: rxResource({
        loader: () => {
          return merge(
            http
              .get<{ color: string }>('http://localhost:3000/cache-status')
              .pipe(map((res) => console.log('response,', res))),
            fromEvent<MessageEvent>(new EventSource('/api/cache/stream'), 'message').pipe(
              map((evt) => console.log('cache stream status', evt.data))
            )
          );
        },
      }),
      */

// cacheStatus: httpResource<{ ready: boolean; total: number; fetched: number }>(() => {
//   return { url: 'http://localhost:3000/cache-status' };
// }),
