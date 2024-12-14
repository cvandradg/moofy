import * as pdfjsLib from 'pdfjs-dist';
import { inject, Injectable } from '@angular/core';
import { Observable, from, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';
import { routes } from './moofy-to-walmart-routes';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  fileName: string;
}

@Injectable({
  providedIn: 'root',
})
export class PdfExtractService {
  http = inject(HttpClient);

  sendRequest() {
    const url = '/api/';
    const body = {
      username: 'candradeg9182@gmail.com',
      password: 'PastryFactory2024',
      language: 'en',
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Agent': 'AngularApp',
      'X-Bot-Token':
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJsb2dpbklkIjoiY2FuZHJhZGVnOTE4MkBnbWFpbC5jb20iLCJpc3MiOiJrcmFrZW4iLCJleHAiOjE3MzkyMTU0MDksImlhdCI6MTczNDAzMTQwOSwianRpIjoiYTJhNGIxMWYtNjZmMi00YzdlLTk2MTctZjQwOTU4MjFmOTMyIn0.EvVZVyUbeAD540h3zmwNKPi6dDhnjxTneYxKdQULdDlgRoCYfcSWi1og5-3b66kVKL-KNTmSOeeXLu20T1P4ZwwXEAV3nYj7N7V12mlPhHO_3SMdMcMMk_y_ZdpQAdlYKE7zidcTbrYeCvcB0m1mGIyELE_ZnmNrIyB1HbOtHurb8idRXy10D3S5SynXKgztzWDWlyZTnLM-JASAalzab8rvbNDTa3_10qgIzLTgBOsQBzsJyHgpGmtIGRo3rq6RtAs4_mlK-jFG1--QfoXaNxZHx36wToGNIj7s96z2zCMBIK8PRV1ThnfzkEvYl5h3xG3Z8Jy4tvjIzKKJcd7n3w',
    });

    return this.http.post(url, body, { headers });
  }

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
      switchMap((pdfDoc) => this.parsePurchaseOrder(pdfDoc, file.name))
    );
  }

  parsePurchaseOrder(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    fileName: string
  ): Observable<MoofyPO> {
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
        console.log('ITEMS', this.getPurchaseOrderItems(fullPdfDoc));
        return {
          fileName,
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

    console.log(
      'table',
      table.map((x: any) => x.str)
    );

    const itemsAmountIndex = table.findIndex(
      (item) =>
        ('str' in item && item.str === 'Total artic lín') ||
        ('str' in item && item.str === 'Total Line Items')
    );

    const itemsAmount = parseInt(
      this.getTextItemStr(table[itemsAmountIndex + 2])
    );

    console.log('itemsAmount', itemsAmountIndex);

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
        (item) =>
          ('str' in item && item.str === 'Costo Extendí') ||
          ('str' in item && item.str === 'Extended Cost')
      ) + 2;
    return content.slice(itemsIdxStart);
  }

  getTextItemStr(item: unknown): string {
    return item && typeof item === 'object' && 'str' in item
      ? (item as TextItem).str
      : '';
  }
}
