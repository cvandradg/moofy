import { Component, computed, input, signal } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { MenuItem } from '../menu-items';
import { Fontawesome } from '@moofy-admin/shared';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [
    RouterModule,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    Fontawesome,
  ],
  template: `
    <a
      mat-list-item
      [activated]="rla.isActive"
      (click)="nestedItemOpen.set(!nestedItemOpen())"
      [routerLink]="routeHistory() + '/' + item().route"
      [style.--mat-list-list-item-leading-icon-start-space]="indentation()"
      class="menu-item"
      #rla="routerLinkActive"
      routerLinkActive="selected-menu-item"
    >
      <fa-icon matListItemIcon [icon]="['fal', 'folder-arrow-up']"></fa-icon>

      @if(!collapsed()) {
      <span matListItemTitle>{{ item().label }}</span>
      } 
  `,
  styles: `

  @use '@angular/material' as mat;
  
  :host * {
        transition: all 500ms ease-in-out;
      }

  .menu-item {
        border-left: 5px solid;
        border-left-color: rgba(0, 0, 0, 0);

        @include mat.list-overrides((
          active-indicator-shape: 0px,
          active-indicator-color: rgba(0,0,0,0.05),
          list-item-one-line-container-height: 56px
        ));
    }

    .selected-menu-item { 
      border-left-color: var(--primary-color);

      @include mat.list-overrides((
        list-item-leading-icon-color: var(--primary-color),
        list-item-hover-leading-icon-color: var(--primary-color),
        list-item-label-text-color: var(--primary-color),
        list-item-focus-label-text-color: var(--primary-color),
        list-item-hover-label-text-color: var(--primary-color),
      ));
    }

  `,
  animations: [
    trigger('expandContractMenu', [
      transition(':enter', [
        style({ opacity: 0, height: '0px' }),
        animate('500ms ease-in-out', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({ opacity: 0, height: '0px' })),
      ]),
    ]),
  ],
})
export class MenuItemComponent {
  item = input.required<MenuItem>();
  collapsed = input.required<boolean>();
  routeHistory = input('');

  level = computed(() => this.routeHistory().split('/').length - 1);
  indentation = computed(() =>
    this.collapsed() ? '16px' : `${16 + this.level() * 16}px`
  );

  nestedItemOpen = signal(false);
}
