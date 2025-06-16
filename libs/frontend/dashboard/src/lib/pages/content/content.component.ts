import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { LabService } from './labyrinth.service';
import { combineLatest, map, Observable, startWith, tap } from 'rxjs';

@Component({
  selector: 'app-content',
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="general-container">
      <form class="example-form">
        <div class="inputs-container">
          <mat-form-field class="example-full-width">
            <mat-label>Origen</mat-label>
            <input
              type="text"
              placeholder="Pick one"
              aria-label="Number"
              matInput
              [formControl]="myControlOrigin"
              [matAutocomplete]="auto"
            />
            <mat-autocomplete autoActiveFirstOption #auto="matAutocomplete">
              @for (option1 of filteredOptionsOrigin | async; track option1) {
              <mat-option [value]="option1">{{ option1 }}</mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>

          <mat-form-field class="example-full-width">
            <mat-label>Destino</mat-label>
            <input
              type="text"
              placeholder="Pick one"
              aria-label="Number"
              matInput
              [formControl]="myControlDestination"
              [matAutocomplete]="auto2"
            />
            <mat-autocomplete #auto2="matAutocomplete">
              @for (option2 of filteredOptionsDestination | async; track
              option2) {
              <mat-option [value]="option2">{{ option2 }}</mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>
        </div>

        @for (path of result; track path.id) {
        <div>
          <span>{{ path.map + '-->>' }} </span>
          <span>{{ path.portal }}</span>
        </div>
        }
      </form>
    </div>
  `,
  styleUrl: './content.component.scss'
})
export class ContentComponent {
  title = 'htf';

  result: any = [];

  labService = inject(LabService);
  myControlOrigin = new FormControl('');
  myControlDestination = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptionsOrigin!: Observable<string[]>;
  filteredOptionsDestination!: Observable<string[]>;

  combinedObservable$!: Observable<[string[], string[]]>;

  ngOnInit() {
    this.filteredOptionsOrigin = this.myControlOrigin.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );

    this.filteredOptionsDestination =
      this.myControlDestination.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter2(value || ''))
      );

    this.combinedObservable$ = combineLatest([
      this.filteredOptionsOrigin,
      this.filteredOptionsDestination,
    ]).pipe(
      tap(([originOptions, destinationOptions]) =>
        console.log('Combined options:', {
          origin: originOptions,
          destination: destinationOptions,
        })
      )
    );

    // Subscribe to handle combined behavior
    this.combinedObservable$.subscribe(
      ([originOptions, destinationOptions]) => {
        // Initial combined logic
        console.log('Both emitted:', {
          originOptions,
          destinationOptions,
        });

        const [origin] = originOptions;
        const [destination] = destinationOptions;

        this.labService.findPath(origin, destination);
        // console.log('Path:', this.labService.findPath(origin, destination));
        this.result = this.labService.findPath(origin, destination);
        console.log('Path:', this.result);
        // return this.path;
      }
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.labService.labKeys.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  private _filter2(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.labService.labKeys.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  filterByPrefix(prefix: string): void {
    this.labService.filterElementsByPrefix(prefix);
  }
}
