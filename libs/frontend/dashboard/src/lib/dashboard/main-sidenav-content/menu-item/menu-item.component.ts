import { Fontawesome } from '@moofy-admin/shared';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { Component, computed, input, signal } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

import { MenuItem } from '../../../menu-items';

@Component({
  selector: 'moofy-main-sidenav-item',
  imports: [Fontawesome, RouterModule, MatListModule, MatIconModule, RouterLinkActive],
  template: `
    <div class="item-container">
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
        <fa-icon matListItemIcon [icon]="item().icon"></fa-icon>
      </a>

      <!-- <span *ngIf="!collapsed()" matListItemTitle>{{ item().label }}</span> -->
    </div>
  `,
  styleUrls: ['./menu-item.component.scss'],
  animations: [
    trigger('expandContractMenu', [
      transition(':enter', [
        style({ opacity: 0, height: '0px' }),
        animate('500ms ease-in-out', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [animate('500ms ease-in-out', style({ opacity: 0, height: '0px' }))]),
    ]),
  ],
})
export class MenuItemComponent {
  item = input.required<MenuItem>();
  collapsed = input.required<boolean>();
  routeHistory = input('');

  level = computed(() => this.routeHistory().split('/').length - 1);
  indentation = computed(() => (this.collapsed() ? '16px' : `${16 + this.level() * 16}px`));

  nestedItemOpen = signal(false);
}
