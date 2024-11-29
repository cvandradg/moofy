import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainSidenavComponent } from './main-sidenav.component';
import { MatNavList } from '@angular/material/list';
import { Fontawesome } from '@moofy-admin/shared';
import { RouterModule } from '@angular/router';

describe('MainSidenavComponent', () => {
  let component: MainSidenavComponent;
  let fixture: ComponentFixture<MainSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatNavList,
        Fontawesome,
        MainSidenavComponent,
        RouterModule.forRoot([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
