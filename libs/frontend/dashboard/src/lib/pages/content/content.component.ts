import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <h1>Content</h1>

    <router-outlet />
  `,
  styles: [],
})
export class ContentComponent {}
