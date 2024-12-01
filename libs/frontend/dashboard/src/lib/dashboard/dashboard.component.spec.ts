import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MainSidenavContentComponent } from '../main-sidenav-content/main-sidenav-content.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatSidenavModule,
        NoopAnimationsModule,
        CommonModule,
        RouterModule,
        MatToolbarModule,
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        MatListModule,
        RouterModule,
        MainSidenavContentComponent,
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
