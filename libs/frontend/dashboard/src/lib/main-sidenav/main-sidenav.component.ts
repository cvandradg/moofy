import {
  Input,
  signal,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MODULES } from '@moofy-admin/shared';
import { IconProp } from '@fortawesome/angular-fontawesome/types';
import { Fontawesome } from '@moofy-admin/shared';

export type MenuItem = {
  icon: IconProp;
  label: string;
  path?: string;
};

@Component({
  selector: 'moofy-main-sidenav',
  standalone: true,
  imports: [MODULES, Fontawesome],
  templateUrl: './main-sidenav.component.html',
  styleUrl: './main-sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainSidenavComponent {
  sideNavCollapse = signal(false);

  @Input() set collapsed(val: boolean) {
    this.sideNavCollapse.set(val);
  }

  profilePicSize = computed(() => (this.sideNavCollapse() ? '32' : '100'));

  menuItems = signal<MenuItem[]>([
    { label: 'Perfil', icon: ['fas', 'user'], path: 'test1' },
    { label: 'Dietas', icon: ['fas', 'salad'], path: 'test2' },
    { label: 'Comida', icon: ['fas', 'pot-food'], path: 'test3' },
    { label: 'Utilidades', icon: ['fas', 'telescope'], path: 'test4' },
  ]);
}
