import { Type } from '@angular/core';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { CommentsComponent } from './pages/comments/comments.component';
import { ContentComponent } from './pages/content/content.component';
import { UploadOrdersComponent } from './pages/dashboard/dashboard.component';


export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
  subItems?: MenuItem[];
  component?: Type<unknown>;
};

export const menuItems: MenuItem[] = [
  {
    icon: 'dashboard',
    label: 'Subir Órdenes',
    route: 'dashboard',
    component: UploadOrdersComponent,
  },
  {
    icon: 'video_library',
    label: 'Historial',
    route: 'content',
    component: ContentComponent,
  },
  {
    icon: 'analytics',
    label: 'Estadísticas',
    route: 'analytics',
    component: AnalyticsComponent,
  },
  {
    icon: 'comment',
    label: 'Predicciones',
    route: 'comments',
    component: CommentsComponent,
  },
  {
    icon: 'comment',
    label: 'Documentación',
    route: 'comments',
    component: CommentsComponent,
  },
];
