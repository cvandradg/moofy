import * as pdfjsLib from 'pdfjs-dist';
import { Injectable } from '@angular/core';
import { Observable, from, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';
import { routes } from './moofy-to-walmart-routes';
/* @vite-ignore */
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';

interface Item {
  cost: string;
  article: string;
  quantity: string;
}

interface MoofyPO {
  supermarket: string | null;
  cancellationDate: string | null;
  sendDate: string | null;
  items: Item[];
}

@Injectable({
  providedIn: 'root',
})
export class PdfExtractService {
  extractOrderByRoute(files: File[]): Observable<Record<string, MoofyPO[]>> {
    const routeMap: Record<string, MoofyPO[]> = Object.keys(routes).reduce(
      (acc, route) => ({ ...acc, [route]: [] }),
      {} as Record<string, MoofyPO[]>
    );

    return this.extractTextFromPDFs(files).pipe(
      map((purchaseOrders) => {
        purchaseOrders.forEach((purchaseOrder) => {
          const routeEntry = Object.entries(routes).find(([_, supermarkets]) =>
            supermarkets.some((s) => s.name === purchaseOrder.supermarket)
          );

          if (!routeEntry) {
            routeMap['unProcessed'].push(purchaseOrder);
            return;
          }

          const [route, supermarkets] = routeEntry;
          const match = supermarkets.find(
            (s) => s.name === purchaseOrder.supermarket
          );

          if (!match) {
            routeMap['unProcessed'].push(purchaseOrder);
            return;
          }

          routeMap[route].push(purchaseOrder);
        });
        return routeMap;
      })
    );
  }

  extractTextFromPDFs(files: File[]): Observable<MoofyPO[]> {
    return forkJoin(
      files.map((file) => (file ? this.extractTextFromPdf(file) : of(null)))
    ).pipe(map((results) => results.filter(Boolean) as MoofyPO[]));
  }

  extractTextFromPdf(file: File): Observable<MoofyPO> {
    return from(file.arrayBuffer()).pipe(
      switchMap((pdfData) =>
        from(pdfjsLib.getDocument({ data: pdfData }).promise)
      ),
      switchMap((pdfDoc) => this.parsePurchaseOrder(pdfDoc))
    );
  }

  parsePurchaseOrder(pdfDoc: pdfjsLib.PDFDocumentProxy): Observable<MoofyPO> {
    return forkJoin(
      Array.from({ length: pdfDoc.numPages }, (_, i) =>
        from(pdfDoc.getPage(i + 1)).pipe(
          switchMap((page) => from(page.getTextContent())),
          map((textContent) => textContent.items)
        )
      )
    ).pipe(
      map((pages) => {
        const fullPdfDoc = pages.flat();
        return {
          supermarket: this.getTextItemStr(fullPdfDoc[56]),
          sendDate: this.getTextItemStr(fullPdfDoc[14]),
          cancellationDate: this.getTextItemStr(fullPdfDoc[18]),
          items: this.getPurchaseOrderItems(fullPdfDoc),
        };
      })
    );
  }

  getPurchaseOrderItems(content: (TextItem | TextMarkedContent)[]): Item[] {
    const table = this.getPurchaseOrderTable(content);

    const itemsAmountIndex = table.findIndex(
      (item) => 'str' in item && item.str === 'Total artic lín'
    );
    const itemsAmount = parseInt(
      this.getTextItemStr(table[itemsAmountIndex + 2])
    );

    return Array.from({ length: itemsAmount }, (_, i) => {
      const currentItemIndex = table.findIndex(
        (item): item is TextItem => 'str' in item && item.str === `00${i + 1}`
      );

      //si no encuentra artitulo tiene que tirar un error y detener el proceso de lectura del file

      return {
        article: this.getTextItemStr(table[currentItemIndex + 2] as TextItem),
        quantity: this.getTextItemStr(table[currentItemIndex + 14] as TextItem),
        cost: this.getTextItemStr(table[currentItemIndex + 20] as TextItem),
      };
    });
  }

  getPurchaseOrderTable(
    content: (TextItem | TextMarkedContent)[]
  ): (TextItem | TextMarkedContent)[] {
    const itemsIdxStart =
      content.findIndex(
        (item) => 'str' in item && item.str === 'Costo Extendí'
      ) + 2;
    return content.slice(itemsIdxStart);
  }

  getTextItemStr(item: unknown): string {
    return item && typeof item === 'object' && 'str' in item
      ? (item as TextItem).str
      : '';
  }
}
