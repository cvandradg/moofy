import { MODULES } from '@moofy-admin/shared';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'moofy-header-component',
  standalone: true,
  imports: [MODULES],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponentComponent {}
