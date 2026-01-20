import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PurchaseOrder } from '../types/general-types';
import { moofyToWalmartRoutes } from './moofy-to-walmart-routes';

type PdfImg = {
  po: PurchaseOrder;
  dataUrl: string;
  widthPt: number;
};

import type { Content, ContentText, ContentImage, Margins } from 'pdfmake/interfaces';

@Injectable({ providedIn: 'root' })
export class PrintOrdersService {
  private readonly locationToRoute: Record<string, number> = Object.entries(moofyToWalmartRoutes).reduce(
    (acc, [routeKey, stops]) => {
      const num = Number(routeKey);
      stops.forEach((stop) => (acc[stop.name] = num));
      return acc;
    },
    {} as Record<string, number>
  );

  getRouteForLocation(location: string): keyof typeof moofyToWalmartRoutes {
    return this.locationToRoute[location] as keyof typeof moofyToWalmartRoutes;
  }

  async generatePdfFromImage(purchaseOrders: PurchaseOrder[]) {
    console.log('🔥 generatePdfFromImage called with', purchaseOrders.length, 'items');

    const results = await Promise.allSettled(
      purchaseOrders.map(async (po): Promise<PdfImg> => {
        const safeId = encodeURIComponent(String(po.DocumentId));
        const url = `https://storage.googleapis.com/purchase-orders-screenshots/purchase-orders/po-${safeId}.png`;

        const originalDataUrl = await this.toImageDataUrl(url); // <-- validates 200 + image/*
        const imgEl = await this.loadImg(originalDataUrl);

        const croppedDataUrl = this.cropTopFraction(imgEl, 0.94); // keep top 94%
        const w = imgEl.naturalWidth || imgEl.width;

        return { po, dataUrl: croppedDataUrl, widthPt: w * 0.45 };
      })
    );

    const ok = results.filter((r): r is PromiseFulfilledResult<PdfImg> => r.status === 'fulfilled');
    const bad = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');

    if (bad.length) {
      console.warn(`⚠️ Skipped ${bad.length} purchase orders due to missing/invalid images.`);
      bad.slice(0, 20).forEach((r, idx) => console.warn(`  #${idx + 1}`, r.reason));
      if (bad.length > 20) console.warn(`  ...and ${bad.length - 20} more`);
    }

    const imgs = ok.map((r) => r.value);

    if (!imgs.length) {
      console.warn('❌ No valid images found. Nothing to print.');
      return;
    }

    const content: Content[] = imgs.flatMap(({ po, dataUrl, widthPt }, idx) => {
      const routeNum = this.getRouteForLocation(po.location);
      const stops = moofyToWalmartRoutes[routeNum] || [];
      const matchingStop = stops.find((stop) => stop.name === po.location);

      const header: ContentText = {
        text: `Úbicacion: ${matchingStop?.location ?? po.location}, Ruta: ${routeNum}`,
        fontSize: 8,
        bold: true,
        margin: [0, 10, 10, 0] as Margins, // ✅ important: tuple, not number[]
        alignment: 'right',
        ...(idx > 0 ? { pageBreak: 'before' as const } : {}),
      };

      const imageBlock: ContentImage = {
        image: dataUrl,
        width: widthPt,
      };

      return [header, imageBlock];
    });

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [0, 0, 0, 0],
      content, // ✅ now matches
    };

    pdfMake.createPdf(docDefinition).download('purchase-orders.pdf');
  }

  /** Only returns when the URL is a real image (2xx + content-type image/*). */
  private async toImageDataUrl(url: string): Promise<string> {
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`Image not found: ${res.status} ${res.statusText} (${url})`);
    }

    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (!ct.startsWith('image/')) {
      throw new Error(`Not an image (content-type=${ct}) (${url})`);
    }

    const blob = await res.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`FileReader failed (${url})`));
      reader.readAsDataURL(blob);
    });
  }

  private loadImg(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Failed to decode image dataUrl'));
      i.src = dataUrl;
    });
  }

  private cropTopFraction(img: HTMLImageElement, keepFraction = 0.5): string {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const keptH = Math.floor(h * keepFraction);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = keptH;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context from canvas');

    ctx.drawImage(img, 0, 0, w, keptH, 0, 0, w, keptH);
    return canvas.toDataURL('image/png');
  }
}
