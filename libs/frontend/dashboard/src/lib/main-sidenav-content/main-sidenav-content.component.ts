import { menuItems } from '../menu-items';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Component, computed, input, output, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { Fontawesome } from '@moofy-admin/shared';
import { IconProp } from '@fortawesome/angular-fontawesome/types';

@Component({
  selector: 'moofy-main-sidenav-content',
  standalone: true,
  template: `
    <div class="main-sidenav-container">
      <mat-nav-list>
        @for (item of menuItems; track item.label) {
        <moofy-main-sidenav-item [item]="item" [collapsed]="collapsed()" />
        }
      </mat-nav-list>

      <div
        class="toggle-main-nav-button"
        (click)="toggleOpen()"
        (keydown.enter)="toggleOpen()"
        (keydown.space)="toggleOpen()"
        tabindex="0"
        role="button"
        aria-label="Toggle navigation status"
      >
        <fa-icon [icon]="currentIcon()" />
      </div>
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

      .toggle-main-nav-button {
        position: absolute;
        bottom: 0;
        left: 0;
        padding: 0.5rem;

        fa-icon {
          font-size: 2rem;
        }
      }

      .hide-header-text {
        height: 0 !important;
        opacity: 0;
      }
    `,
  ],
  imports: [
    Fontawesome,
    CommonModule,
    RouterModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MenuItemComponent,
  ],
})
export class MainSidenavContentComponent {
  state = signal(0);
  toggleOpenStatus = output<number>();
  collapsed = input<boolean>(false);

  menuItems = menuItems;

  profilePicSize = computed(() => (this.collapsed() ? '32' : '100'));

  toggleOpen(): void {
    const state = (this.state() + 1) % 3;
    this.state.set(state);
    this.toggleOpenStatus.emit(state);
  }

  currentIcon = computed<IconProp>(() => {
    const icons: IconProp[] = [
      ['fal', 'lock-keyhole-open'],
      ['fal', 'lock-open'],
      ['fal', 'lock-keyhole'],
    ];

    return icons[this.state()];
  });
}
