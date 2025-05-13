import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'purchase-orders',
    loadChildren: () => import('@moofy-admin/purchase-orders').then((m) => m.purchaseOrdersRoutes),
  },
  {
    path: '',
    loadChildren: () => import('@moofy-admin/dashboard').then((m) => m.dashboardRoutes),
  },
];
