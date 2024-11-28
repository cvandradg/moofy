import { MODULES } from '@moofy-admin/shared';
import { MatSidenav } from '@angular/material/sidenav';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';

@Component({
  selector: 'moofy-dashboard',
  standalone: true,
  imports: [MODULES],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  reason = '';

  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }
}
