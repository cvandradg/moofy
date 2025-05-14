import { withHooks, withProps, withState, signalStore, withMethods, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

import { tap } from 'rxjs';
import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { PurchaseOrdersService } from '../services/purchase-order.service';
import { withCallState, withDevtools } from '@angular-architects/ngrx-toolkit';

export const initialState: any = {
  sessionId: '',
  name: '',
  email: null,
};

export const purchaseOrdersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('purchaseOrdersStore' + Math.random()),
  withProps(() => ({
    purchaseOrdersService: inject(PurchaseOrdersService),
  })),
  withComputed((store) => ({})),
  withCallState(),
  withMethods((store) => ({
    fetchPurchaseOrders: rxMethod<void>(() => {
      return store.purchaseOrdersService.fetchInboundDocuments().pipe(
        tapResponse(
          (res) => console.log('signal store purchase order call', res),

          (error: Error) => {
            console.error('Error in store:', error);
          }
        )
      );
    }),
    getCacheStatus: rxMethod<void>(() => {
      return store.purchaseOrdersService.cacheStatus().pipe(
        tapResponse(
          (res) => console.log('what is the status?', res),

          (error: Error) => {
            console.error('Error in store:', error);
          }
        )
      );
    }),
  })),
  withHooks({})
);
