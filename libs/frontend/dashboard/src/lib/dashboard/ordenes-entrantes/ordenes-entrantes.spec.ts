import { Firestore } from '@angular/fire/firestore';
import { OrdenesEntrantes } from './ordenes-entrantes';
import { InboundDocument } from '@moofy-admin/shared';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceRef, signal, WritableSignal } from '@angular/core';

describe('OrdenesEntrantes', () => {
  let component: OrdenesEntrantes;
  let fixture: ComponentFixture<OrdenesEntrantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenesEntrantes],
      providers: [{ provide: Firestore, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdenesEntrantes);
    component = fixture.componentInstance;

    const emptyDocs: WritableSignal<InboundDocument[]> = signal([]);
    const notLoading = signal(false);
    const noError = signal<Error | undefined>(undefined);

    const fakeFetch: Partial<ResourceRef<InboundDocument[]>> = {
      value: emptyDocs,
      isLoading: notLoading,
      error: noError,
    };

    component.fetchInboundDocuments = fakeFetch as ResourceRef<InboundDocument[]>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
