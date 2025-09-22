import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MODULES } from '@moofy-admin/shared';

@Component({
  selector: 'moofy-settings-sidenav-content',
  imports: [MODULES],
  templateUrl: './settings-sidenav-content.component.html',
  styleUrl: './settings-sidenav-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsSidenavContentComponent {
  selectedTheme = 'light';

  themes = [
    { name: 'light', icon: 'clouds-moon' },
    { name: 'dark', icon: 'sun-cloud' },
  ];

  test(theme: any) {
    this.selectedTheme = theme.name;
  }
}
