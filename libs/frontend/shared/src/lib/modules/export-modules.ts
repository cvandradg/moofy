import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LetDirective, PushPipe } from '@ngrx/component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Fontawesome } from '../assets/fontawesome/fontawesome';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';

import { TableModule } from 'primeng/table';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';

export const MODULES = [
  PushPipe,
  FormsModule,
  Fontawesome,
  CommonModule,
  LetDirective,
  RouterModule,
  MatCardModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatTabsModule,
  MatRadioModule,
  MatTableModule,
  MatInputModule,
  MatChipsModule,
  MatSelectModule,
  MatButtonModule,
  MatDialogModule,
  MatDividerModule,
  MatStepperModule,
  MatSidenavModule,
  MatToolbarModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatExpansionModule,
  ReactiveFormsModule,
  MatSlideToggleModule,
  MatAutocompleteModule,
  MatProgressSpinnerModule,
    TableModule,
  AutoCompleteModule,
  InputTextModule,
];
