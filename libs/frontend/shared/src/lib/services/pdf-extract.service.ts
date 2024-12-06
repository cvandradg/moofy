import * as pdfjsLib from 'pdfjs-dist';
import { Injectable } from '@angular/core';
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';
import { routes } from './moofy-to-walmart-routes';
/* @vite-ignore */
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';

interface item {
  cost: string;
  article: string;
  quantity: string;
}

interface moofyPO {
  supermarket: string | null;
  cancellationDate: string | null;
  sendDate: string | null;
  items: item[];
}

@Injectable({
  providedIn: 'root',
})
export class PdfExtractService {
  async extractOrderByRoute(files: any[]): Promise<Record<string, any[]>> {
    const routeMap: Record<string, any[]> = Object.keys(routes).reduce(
      (acc, route) => ({ ...acc, [route]: [] }),
      {}
    );
  
    const extractedPdfOrders = await this.extractTextFromPDFs(files);
  
    extractedPdfOrders.forEach((order) => {
      const routeEntry = Object.entries(routes).find(([_, supermarkets]) =>
        supermarkets.some((supermarket) => supermarket.name === order.supermarket)
      );
  
      if (!routeEntry) return;
  
      const [route, supermarkets] = routeEntry;
      const match = supermarkets.find(
        (supermarket) => supermarket.name === order.supermarket
      );
  
      if (!match) return;
  
      routeMap[route].push({ ...order, destination: match.location });
    });
  
    return routeMap;
  }
  
  async extractTextFromPDFs(files: any[]): Promise<any[]> {
    return Promise.all(
      files.map(async (file) => {
        if (file) {
          return this.extractTextFromPdf(file);
        }
        return null;
      })
    ).then((results) => results.filter((result) => result !== null));
  }

  async extractTextFromPdf(file: File): Promise<moofyPO> {
    const pdfData = await file.arrayBuffer();
    const pdf = pdfjsLib.getDocument({ data: pdfData });
    const pdfDoc = await pdf.promise;

    return this.parsePurchaseOrder(pdfDoc);
  }

  async parsePurchaseOrder(
    pdfDoc: pdfjsLib.PDFDocumentProxy
  ): Promise<moofyPO> {
    const extractPageItems = async (pageNumber: number) => {
      const page = await pdfDoc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      return textContent.items;
    };

    // Extract all items from the PDF document
    const fullPdfDoc: (TextItem | TextMarkedContent)[] = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      fullPdfDoc.push(...(await extractPageItems(i)));
    }

    // Construct and return the purchase order object
    return {
      supermarket: this.getTextItemStr(fullPdfDoc[56]),
      sendDate: this.getTextItemStr(fullPdfDoc[14]),
      cancellationDate: this.getTextItemStr(fullPdfDoc[18]),
      items: this.getPurchaseOrderItems(fullPdfDoc),
    };
  }

  getPurchaseOrderItems(content: (TextItem | TextMarkedContent)[]): item[] {
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

  getTextItemStr = (item: unknown): string => {
    if (item && typeof item === 'object' && 'str' in item) {
      return (item as TextItem).str;
    }
    return '';
  };
}
