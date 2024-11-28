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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

export const MODULES = [
  PushPipe,
  FormsModule,
  CommonModule,
  LetDirective,
  RouterModule,
  MatCardModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatTabsModule,
  MatRadioModule,
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
  ReactiveFormsModule,
  MatSlideToggleModule,
  MatAutocompleteModule,
  MatProgressSpinnerModule,
];
