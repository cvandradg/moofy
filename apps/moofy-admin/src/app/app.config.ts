import { appRoutes } from './app.routes';
import { provideRouter } from '@angular/router';
import { environment } from '@moofy-admin/shared';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideClientHydration(),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    {
      provide: FIREBASE_OPTIONS,
      useValue: environment.firebaseConfig,
    },
  ],
};
