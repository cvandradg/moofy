import { Type } from '@angular/core';
import { ContentComponent } from './pages/content/content.component';
import { CommentsComponent } from './pages/comments/comments.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { UploadOrdersComponent } from './dashboard/upload-orders/upload-orders.component';
import { ProcessedOrdersComponent } from './dashboard/upload-orders/processed-orders/processed-orders.component';

export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
  subItems?: MenuItem[];
  component?: Type<unknown>;
};

export const menuItems: MenuItem[] = [
  {
    icon: 'folder-arrow-up',
    label: 'Subir Órdenes',
    route: 'subir-ordenes',
    component: UploadOrdersComponent,
    subItems: [
      {
        icon: 'folder-arrow-up',
        label: 'Ordenes Procesadas',
        route: 'ordenes-procesadas',
        component: ProcessedOrdersComponent,
      },
    ],
  },
  {
    icon: 'files',
    label: 'Historial',
    route: 'historial',
    component: ContentComponent,
  },
  {
    icon: 'chart-column',
    label: 'Estadísticas',
    route: 'estadisticas',
    component: AnalyticsComponent,
  },
  {
    icon: 'chart-mixed-up-circle-dollar',
    label: 'Predicciones',
    route: 'predicciones',
    component: CommentsComponent,
  },
  {
    icon: 'book-sparkles',
    label: 'Documentación',
    route: 'documentacion',
    component: CommentsComponent,
  },
  {
    icon: 'screwdriver-wrench',
    label: 'Configuración',
    route: 'configuracion',
    component: CommentsComponent,
  },
];
