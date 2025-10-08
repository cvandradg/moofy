import { ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'moofy-upload-searcher',
  standalone: false,
  templateUrl: './searcher.html',
  styleUrl: './searcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Searcher {}
