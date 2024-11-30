import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    <p>playlists works!</p>
  `,
  styles: ``,
})
export class PlaylistsComponent {}
