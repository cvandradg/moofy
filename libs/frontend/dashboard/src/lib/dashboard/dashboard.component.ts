import { MatSidenav } from '@angular/material/sidenav';
import { MODULES } from '@moofy-admin/shared';
import { MainSidenavContentComponent } from './main-sidenav-content/main-sidenav-content.component';
import { signal, computed, Component, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { SettingsSidenavContentComponent } from './settings-sidenav-content/settings-sidenav-content.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient, httpResource } from '@angular/common/http';
import { fromEvent, map } from 'rxjs';

@Component({
  selector: 'moofy-dashboard',
  imports: [MODULES, MainSidenavContentComponent, SettingsSidenavContentComponent],
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
  collapsed = signal(true);
  // sidenavWidth = computed(() => (this.collapsed() ? '65px' : '250px'));
  // sidenavWidth = computed(() => (this.collapsed() ? '65px' : '165px'));
  // sidenavWidth = computed(() => (this.collapsed() ? 82 : 165));
  sidenavWidth = computed(() => (this.collapsed() ? '90px' : '225px'));
}
