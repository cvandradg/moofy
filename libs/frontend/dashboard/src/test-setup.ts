// test-setup.ts (at the very top)

// 0) Mock out the shared module so purchaseOrdersStore is always our stub
jest.mock('@moofy-admin/shared', () => {
  // grab everything else from the real module
  const actual = jest.requireActual('@moofy-admin/shared');
  return {
    ...actual,
    // replace only purchaseOrdersStore with a noop stub:
    purchaseOrdersStore: {
      fetchInboundDocuments: { isLoading: () => false },
      moofyToWalmartRoutes: () => [],
      purchaseOrderByRoutes: () => ({}),
    },
  };
});

// 1) Polyfill ReadableStream for Firestore (undici)
import { ReadableStream } from 'web-streams-polyfill';
if (!(globalThis as any).ReadableStream) {
  (globalThis as any).ReadableStream = ReadableStream;
}

// 2) Load Zone.js before initializing the Angular TestBed

// 3) Initialize the Angular TestBed via Jest preset (zone-based)
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

// …and any other global setup you have…
