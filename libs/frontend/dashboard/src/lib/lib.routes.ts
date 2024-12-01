import { Route } from '@angular/router';
import { DashboardComponent as dashboard } from './dashboard/dashboard.component';
import { MenuItem, menuItems } from './menu-items';

const itemToRoute = (i: MenuItem): Route => {
  const route: Route = { path: i.route, component: i.component };
  if (i.subItems) {
    route.children = i.subItems.map((s) => itemToRoute(s));
  }

  return route;
};

export const dashboardRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'prefix',
    component: dashboard,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      ...menuItems.map((i) => itemToRoute(i)),
    ],
  },
];
