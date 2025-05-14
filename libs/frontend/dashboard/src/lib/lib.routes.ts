import { Route } from '@angular/router';
import { DashboardComponent as dashboard } from './dashboard/dashboard.component';
import { MenuItem, menuItems } from './menu-items';

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
        redirectTo: 'ordenes-de-compra',
      },
      ...menuItems.map((i) => toRoute(i)),
    ],
  },
];
