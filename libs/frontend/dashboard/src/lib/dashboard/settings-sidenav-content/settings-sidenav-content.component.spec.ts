import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsSidenavContentComponent } from './settings-sidenav-content.component';

describe('SettingsSidenavContentComponent', () => {
  let component: SettingsSidenavContentComponent;
  let fixture: ComponentFixture<SettingsSidenavContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsSidenavContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsSidenavContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
