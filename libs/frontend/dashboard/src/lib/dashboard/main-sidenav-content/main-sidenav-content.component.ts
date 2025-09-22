import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Component, computed, input, output, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Fontawesome } from '@moofy-admin/shared';
import { IconProp } from '@fortawesome/angular-fontawesome/types';
import { menuItems } from '../../menu-items';
import { MenuItemComponent } from './menu-item/menu-item.component';

@Component({
  selector: 'moofy-main-sidenav-content',
  template: `
    <div class="main-sidenav-container">
      <mat-nav-list>
        @for (item of menuItems; track item.label) {
          <moofy-main-sidenav-item [item]="item" [collapsed]="collapsed()" />
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
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
      }

      .main-sidenav-container {
        padding: 0 0 0 1rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 0.5rem 0 1rem;
        height: calc(100% - 3.5rem);
      }

      .sidenav-header {
        display: flex;
        flex-direction: column;
        align-items: center;

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
  imports: [Fontawesome, RouterModule, MatIconModule, MatListModule, MatSidenavModule, MenuItemComponent],
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
}
