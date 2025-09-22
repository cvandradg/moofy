import { Type } from '@angular/core';
import { ContentComponent } from './pages/content/content.component';
import { CommentsComponent } from './pages/comments/comments.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { UploadOrdersComponent } from './dashboard/upload-orders/upload-orders.component';
import { Route } from '@angular/router';
import { IconLookup, IconName } from '@fortawesome/fontawesome-common-types';
import { IconPrefix } from '@fortawesome/angular-fontawesome';

export type MenuItem = {
  icon: IconName | [IconPrefix, IconName] | IconLookup;
  label: string;
  route: string;
  subItems?: MenuItem[];
  loadChildren?: () => Promise<Route[]>;
  component?: Type<unknown>;
};

export const menuItems: MenuItem[] = [
  {
    icon: ['far', 'folder'],
    label: 'Subir Órdenes',
    route: 'subir-ordenes',
    component: UploadOrdersComponent,
    // subItems: [
    //   {
    //     icon: ['far', 'folder'],
    //     label: 'Ordenes Procesadas',
    //     route: 'ordenes-procesadas',
    //     component: ProcessedOrdersComponent,
    //   },
    // ],
  },
  {
    icon: ['far', 'rectangle-list'],
    label: 'Historial',
    route: 'historial',
    component: ContentComponent,
  },
  {
    icon: ['far', 'chart-bar'],
    label: 'Estadísticas',
    route: 'estadisticas',
    component: AnalyticsComponent,
  },
  {
    icon: ['far', 'eye'],
    label: 'Predicciones',
    route: 'predicciones',
    component: CommentsComponent,
  },
  {
    icon: ['far', 'file'],
    label: 'Documentación',
    route: 'documentacion',
    component: CommentsComponent,
  },
  {
    icon: ['fas', 'sliders'],
    label: 'Configuración',
    route: 'configuracion',
    component: CommentsComponent,
  },
];
