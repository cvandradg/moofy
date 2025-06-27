import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import * as rxjsInterop from '@angular/core/rxjs-interop'; // ← import the rxResource host
import { UploadOrdersComponent } from './upload-orders.component';
import { RouterModule } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Fontawesome, MODULES } from '@moofy-admin/shared';

jest.mock('@angular/core/rxjs-interop', () => ({
  __esModule: true,
  rxResource: jest.fn().mockReturnValue({
    value: () => [],
    isLoading: () => false,
    refetch: () => {},
    error: undefined,
  }),
}));

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
