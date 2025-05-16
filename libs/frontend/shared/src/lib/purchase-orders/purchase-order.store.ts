import { computed, effect } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { withCallState, withDevtools } from '@angular-architects/ngrx-toolkit';
import { withHooks, withProps, withState, signalStore, withMethods, withComputed } from '@ngrx/signals';
import { withMoofyPurchaseOrders } from './store-features/withMoofyPurchaseOrders';

export const initialState: any = {
  sessionId: '',
  name: '',
  email: null,
};

export const purchaseOrdersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('purchaseOrdersStore' + Math.random()),
  withComputed((store) => ({})),
  withMoofyPurchaseOrders(),
  withCallState(),
  withMethods((store) => ({})),
  withHooks({
    onInit: (store) => {
      effect(() => {
        console.log('Effect cacheStatus', store.cacheStatus.value());
        console.log('Effect Purchase orders details', store.purchaseOrdersDetails.value());
        console.log('Effect fetchInboundDocuments', store.fetchInboundDocuments.value());
        console.log('Effect purchaseOrdersDetails', store.purchaseOrdersDetails.value());
      });
    },
  })
);
