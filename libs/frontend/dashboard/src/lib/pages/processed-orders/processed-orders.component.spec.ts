import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessedOrdersComponent } from './processed-orders.component';

describe('ProcessedOrdersComponent', () => {
  let component: ProcessedOrdersComponent;
  let fixture: ComponentFixture<ProcessedOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessedOrdersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessedOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
