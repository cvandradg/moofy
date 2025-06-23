import { Route } from '@angular/router';
import { DashboardComponent as dashboard } from './dashboard/dashboard.component';
import { MenuItem, menuItems } from './menu-items';
import { UploadOrdersComponent } from './dashboard/upload-orders/upload-orders.component';

const toRoute = ({ route, loadChildren, component, subItems }: MenuItem): Route => ({
  path: route,
  ...(loadChildren && { loadChildren }),
  ...(component && { component }),
  ...(subItems?.length && { children: subItems.map(toRoute) }),
});

export const dashboardRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'prefix',
    component: dashboard,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'subir-ordenes',
      },
      {
        path: 'subir-ordenes',
        component: UploadOrdersComponent,
      },
      ...menuItems.map((i) => toRoute(i)),
    ],
  },
];
