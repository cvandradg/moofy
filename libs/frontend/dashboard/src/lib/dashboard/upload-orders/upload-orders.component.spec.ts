import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { UploadOrdersComponent } from './upload-orders.component';
import { RouterModule } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Fontawesome, MODULES } from '@moofy-admin/shared';

describe('UploadOrdersComponent', () => {
  let fixture: ComponentFixture<UploadOrdersComponent>;
  let component: UploadOrdersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UploadOrdersComponent,
        MODULES,
        Fontawesome,
        RouterModule,
        MatBadgeModule,
        NgxDropzoneModule,
        MatBottomSheetModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
