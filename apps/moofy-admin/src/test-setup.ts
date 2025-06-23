// 1) Polyfill ReadableStream for Firestore (undici)
import { ReadableStream } from 'web-streams-polyfill/ponyfill';
if (!(globalThis as any).ReadableStream) {
  (globalThis as any).ReadableStream = ReadableStream;
}

// 2) Load Zone.js before initializing the Angular TestBed
// 3) Initialize the Angular TestBed via Jest preset (zone-based)
//    …and pass your options here instead of using globalThis.ngJest
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
