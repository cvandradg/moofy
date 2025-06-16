// import { computed, effect } from '@angular/core';
// import { httpResource } from '@angular/common/http';
// import { groupBy } from 'lodash';

// import { withCallState, withDevtools } from '@angular-architects/ngrx-toolkit';
// import { withHooks, withProps, withState, signalStore, withMethods, withComputed } from '@ngrx/signals';
// import { withMoofyPurchaseOrders } from './store-features/withMoofyPurchaseOrders';
// import { moofyToWalmartRoutes } from '../services/moofy-to-walmart-routes';

// export const initialState: any = {
//   sessionId: '',
//   name: '',
//   email: null,
// };

// export const purchaseOrdersStore = signalStore(
//   { providedIn: 'root' },
//   withState(initialState),
//   withDevtools('purchaseOrdersStore' + Math.random()),
//   withMoofyPurchaseOrders(),
//   withComputed((store) => ({
//     moofyToWalmartRoutes: computed(() => Object.keys( moofyToWalmartRoutes)),
//     purchaseOrderByRoutes: computed(() => {
//       const locationToRoute = Object.entries(moofyToWalmartRoutes).reduce(
//         (acc, [routeKey, stops]) => {
//           stops.forEach(({ name }) => {
//             acc[name] = Number(routeKey);
//           });
//           return acc;
//         },
//         {} as Record<string, number>
//       );


//       return groupBy(store.fetchInboundDocuments.value(), el => locationToRoute[el.location]);
//     }),
//   })),
//   withCallState(),
//   withMethods((store) => ({})),
//   withHooks({
//     onInit: (store) => {
//       effect(() => {
//         console.log('moofy routyes', store.purchaseOrderByRoutes());
//         console.log('Effect fetchInboundDocuments', store.fetchInboundDocuments.value());
//         // console.log('Effect purchaseOrdersDetails', store.purchaseOrdersDetails.value());
//       });
//     },
//   })
// );
