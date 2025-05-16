import { httpResource } from '@angular/common/http';
import { signalStoreFeature, withProps } from '@ngrx/signals';

export function withMoofyPurchaseOrders() {
  return signalStoreFeature(
    withProps(() => ({
      cacheStatus: httpResource<{ ready: boolean; total: number; fetched: number }>(() => {
        return { url: 'http://localhost:3000/cache-status' };
      }),
      fetchInboundDocuments: httpResource(() => 'http://localhost:3000/get-inbound-documents'),
      purchaseOrdersDetails: httpResource(() => 'http://localhost:3000/get-inbound-order-details'),
    }))
  );
}

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
