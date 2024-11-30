import { Type } from '@angular/core';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { CommentsComponent } from './pages/comments/comments.component';
import { ContentComponent } from './pages/content/content.component';
import { PlaylistsComponent } from './pages/content/playlists/playlists.component';
import { PostsComponent } from './pages/content/posts/posts.component';
import { VideosComponent } from './pages/content/videos/videos.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ShortsComponent } from './pages/content/videos/shorts/shorts.component';
import { LongFormComponent } from './pages/content/videos/long-form/long-form.component';

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
    label: 'Dashboard',
    route: 'dashboard',
    component: DashboardComponent,
  },
  {
    icon: 'video_library',
    label: 'Content',
    route: 'content',
    component: ContentComponent,
    subItems: [
      {
        icon: 'play_circle',
        label: 'Videos',
        route: 'videos',
        component: VideosComponent,
        subItems: [
          {
            icon: 'movie',
            label: 'Shorts',
            route: 'shorts',
            component: ShortsComponent,
            subItems: [
              {
                icon: 'play_circle',
                label: 'Videos',
                route: 'videos',
                component: VideosComponent,
              },
            ],
          },
          {
            icon: 'tv',
            label: 'Long Form',
            route: 'long-form',
            component: LongFormComponent,
          },
        ],
      },
      {
        icon: 'playlist_play',
        label: 'Playlists',
        route: 'playlists',
        component: PlaylistsComponent,
      },
      {
        icon: 'post_add',
        label: 'Posts',
        route: 'posts',
        component: PostsComponent,
      },
    ],
  },
  {
    icon: 'analytics',
    label: 'Analytics',
    route: 'analytics',
    component: AnalyticsComponent,
  },
  {
    icon: 'comment',
    label: 'Comments',
    route: 'comments',
    component: CommentsComponent,
  },
];
