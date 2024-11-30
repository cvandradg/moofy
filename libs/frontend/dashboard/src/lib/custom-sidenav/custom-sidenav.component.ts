import { Component, computed, input, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { menuItems } from '../menu-items';

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  template: `
    <div class="sidenav-header">
      <img
        [width]="profilePicSize()"
        [height]="profilePicSize()"
        src="/assets/img/logo.svg"
        alt="logo"
      />
      <div class="header-text" [class.hide-header-text]="collapsed()">
        <h2>Your channel</h2>
        <p>Zoaib Khan</p>
      </div>
    </div>
    <mat-nav-list>
      @for (item of menuItems; track item.label) {
      <app-menu-item [item]="item" [collapsed]="collapsed()" />
      }
    </mat-nav-list>
  `,
  styles: [
    `
      :host * {
        transition: all 500ms ease-in-out;
      }

      .sidenav-header {
        padding-top: 24px;
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
export class CustomSidenavComponent {
  collapsed = input<boolean>(false);

  menuItems = menuItems;

  profilePicSize = computed(() => (this.collapsed() ? '32' : '100'));
}
