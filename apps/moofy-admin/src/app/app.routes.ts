import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('@moofy-admin/dashboard').then(
        (m) => m.dashboardRoutes
      ),
  },
];
