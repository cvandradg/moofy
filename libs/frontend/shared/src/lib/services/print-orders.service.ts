import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import { PurchaseOrder } from '../types/general-types';
import { moofyToWalmartRoutes } from './moofy-to-walmart-routes';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Injectable({
  providedIn: 'root',
})
export class PrintOrdersService {
  private readonly locationToRoute: Record<string, number> = Object.entries(moofyToWalmartRoutes).reduce(
    (acc, [routeKey, stops]) => {
      const num = Number(routeKey);
      stops.forEach((stop) => (acc[stop.name] = num));
      return acc;
    },
    {} as Record<string, number>
  );

  // 2) expose a method that just looks up the route
  getRouteForLocation(location: string): keyof typeof moofyToWalmartRoutes {
    return this.locationToRoute[location] as keyof typeof moofyToWalmartRoutes;
  }

  async generatePdfFromImage(purchaseOrders: PurchaseOrder[]) {
    console.log('🔥 generatePdfFromImage called with', purchaseOrders, 'items');

    const imgs = await Promise.all(
      purchaseOrders.map(async (po) => {
        const url = `https://storage.googleapis.com/purchase-orders-screenshots/purchase-orders/po-${po.DocumentId}.png`;
        console.log('dataurl:', url);

        const originalDataUrl = await this.toDataUrl(url);

        const imgEl = await this.loadImg(originalDataUrl);
        const croppedDataUrl = this.cropTopFraction(imgEl, 0.94); // keep top 96%

        return { po, dataUrl: croppedDataUrl, widthPt: imgEl.width * 0.45 };
      })
    );

    const content = imgs.flatMap(({ po, dataUrl, widthPt }, idx) => {
      const routeNum = this.getRouteForLocation(po.location);
      const stops = moofyToWalmartRoutes[routeNum] || [];
      const matchingStop = stops.find((stop) => stop.name === po.location);

      const header: any = {
        text: `Úbicacion: ${matchingStop?.location}, Ruta: ${routeNum}`,
        fontSize: 8,
        bold: true,
        margin: [0, 10, 10, 0],
        alignment: 'right',
        ...(idx > 0 ? { pageBreak: 'before' as const } : {}),
      };
      const imageBlock = {
        image: dataUrl,
        width: widthPt,
      };
      return [header, imageBlock];
    });

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [0, 0, 0, 0],
      content,
    };

    pdfMake.createPdf(docDefinition).download('purchase-orders.pdf');
  }

  private toDataUrl(url: string): Promise<string> {
    return fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
  }

  private loadImg(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
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
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    ctx.drawImage(img, 0, 0, w, keptH, 0, 0, w, keptH);

    return canvas.toDataURL('image/png');
  }
}
