import {
  signal,
  computed,
  Component,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Fontawesome } from '@moofy-admin/shared';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MainSidenavContentComponent } from '../main-sidenav-content/main-sidenav-content.component';

@Component({
  selector: 'moofy-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    RouterModule,
    Fontawesome,
    MainSidenavContentComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  @ViewChild('settingsSidenav') settingsSidenav!: MatSidenav;

  close() {
    this.settingsSidenav.close();
  }
  collapsed = signal(false);
  sidenavWidth = computed(() => (this.collapsed() ? '65px' : '250px'));
}
