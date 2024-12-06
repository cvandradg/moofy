import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutesTableComponent } from './routes-table.component';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('RoutesTableComponent', () => {
  let component: RoutesTableComponent;
  let fixture: ComponentFixture<RoutesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatSortModule,
        MatTableModule,
        NoopAnimationsModule,
        RoutesTableComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
