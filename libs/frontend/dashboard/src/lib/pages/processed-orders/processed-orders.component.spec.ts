import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessedOrdersComponent } from './processed-orders.component';
import { MODULES } from '@moofy-admin/shared';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

describe('ProcessedOrdersComponent', () => {
  let component: ProcessedOrdersComponent;
  let fixture: ComponentFixture<ProcessedOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProcessedOrdersComponent,
        CommonModule,
        MatTableModule,
        CurrencyPipe,
        MODULES,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessedOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
