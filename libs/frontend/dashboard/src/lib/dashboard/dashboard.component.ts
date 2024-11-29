import { MODULES } from '@moofy-admin/shared';
import { MatSidenav } from '@angular/material/sidenav';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  ViewChild,
} from '@angular/core';
import { MainSidenavComponent } from '../main-sidenav/main-sidenav.component';
import { HeaderComponentComponent } from '../header/header.component';

@Component({
  selector: 'moofy-dashboard',
  standalone: true,
  imports: [MODULES, MainSidenavComponent, HeaderComponentComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  collapsed = signal<boolean>(true);

  sidenavWidth = computed(() => (this.collapsed() ? '64px' : '250px'));

  @ViewChild('sidenav2') sidenav2!: MatSidenav;

  reason = '';

  close(reason: string) {
    this.reason = reason;
    this.sidenav2.close();
  }
}
