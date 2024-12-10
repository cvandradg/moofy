import {
  signal,
  computed,
  Component,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MODULES } from '@moofy-admin/shared';
import { MatSidenav } from '@angular/material/sidenav';
import { MainSidenavContentComponent } from '../main-sidenav-content/main-sidenav-content.component';
import { SettingsSidenavContentComponent } from '../settings-sidenav-content/settings-sidenav-content.component';

@Component({
  selector: 'moofy-dashboard',
  standalone: true,
  imports: [
    MODULES,
    MainSidenavContentComponent,
    SettingsSidenavContentComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  @ViewChild('settingsSidenav') settingsSidenav!: MatSidenav;

  openState = 0;

  close() {
    this.settingsSidenav.close();
  }
  collapsed = signal(false);
  // sidenavWidth = computed(() => (this.collapsed() ? '65px' : '250px'));
  // sidenavWidth = computed(() => (this.collapsed() ? '65px' : '165px'));
  sidenavWidth = computed(() => (this.collapsed() ? 65 : 225));
}
