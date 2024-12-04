import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadOrdersComponent } from './upload-orders.component';

describe('UploadOrdersComponent', () => {
  let component: UploadOrdersComponent;
  let fixture: ComponentFixture<UploadOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadOrdersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
