import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'subir-ordenes' },
  {
    path: 'purchase-orders',
    loadChildren: () => import('@moofy-admin/purchase-orders').then((m) => m.purchaseOrdersRoutes),
  },
  {
    path: '',
    loadChildren: () => import('@moofy-admin/dashboard').then((m) => m.dashboardRoutes),
  },
  { path: '**', redirectTo: '' },
];
