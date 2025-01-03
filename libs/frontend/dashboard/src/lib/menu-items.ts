import { Type } from '@angular/core';
import { ContentComponent } from './pages/content/content.component';
import { CommentsComponent } from './pages/comments/comments.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { UploadOrdersComponent } from './dashboard/upload-orders/upload-orders.component';
import { IconProp } from '@fortawesome/angular-fontawesome/types';

export type MenuItem = {
  icon: IconProp;
  label: string;
  route?: string;
  subItems?: MenuItem[];
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
