import { menuItems } from '../menu-items';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Component, computed, input } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'moofy-main-sidenav-content',
  standalone: true,
  template: `
    <div class="main-sidenav-container">
      <div class="sidenav-header">
        <!-- <img
        [width]="profilePicSize()"
        [height]="profilePicSize()"
        src="assets/img/moofy-logo1.jpeg"
        alt="logo"
      /> -->
      </div>
      <mat-nav-list>
        @for (item of menuItems; track item.label) {
        <app-menu-item [item]="item" [collapsed]="collapsed()" />
        }
      </mat-nav-list>
    </div>
  `,
  styles: [
    `
      :host * {
        transition: all 500ms ease-in-out;
      }

      mat-nav-list {
        padding: 0;
      }

      .main-sidenav-container {
        padding: 7rem 0;
      }

      .sidenav-header {
        display: flex;
        flex-direction: column;
        align-items: center;

        > img {
          object-fit: cover;
          object-position: center;
          border-radius: 100%;
          margin-bottom: 10px;
        }

        .header-text {
          text-align: center;
          height: 3rem;

          > h2 {
            margin: 0;
            font-size: 1rem;
            line-height: 1.5rem;
            font-weight: normal;
          }

          > p {
            margin: 0;
            font-size: 0.8rem;
          }
        }
      }

      .hide-header-text {
        height: 0 !important;
        opacity: 0;
      }
    `,
  ],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
    MatIconModule,
    MenuItemComponent,
  ],
})
export class MainSidenavContentComponent {
  collapsed = input<boolean>(false);

  menuItems = menuItems;

  profilePicSize = computed(() => (this.collapsed() ? '32' : '100'));
}
