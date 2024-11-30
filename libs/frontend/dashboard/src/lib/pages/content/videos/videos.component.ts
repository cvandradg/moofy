import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    My Videos
    <router-outlet />
  `,
  styles: ``,
})
export class VideosComponent {}
