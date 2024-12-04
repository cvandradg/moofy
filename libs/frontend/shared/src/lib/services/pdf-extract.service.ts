import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import {
  TextContent,
  TextItem,
  TextMarkedContent,
} from 'pdfjs-dist/types/src/display/api';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';

interface moofyPO {
  supermarket: string | null;
  cancellationDate: string | null;
  sendDate: string | null;
  items: any[];
}

@Injectable({
  providedIn: 'root',
})
export class PdfExtractService {
  async extractTextFromPdf(file: File): Promise<moofyPO> {
    try {
      const pdfData = await file.arrayBuffer();
      const pdf = pdfjsLib.getDocument({ data: pdfData });
      const pdfDoc = await pdf.promise;

      const textPages: moofyPO = {} as moofyPO;

      return this.parsePurchaseOrder(pdfDoc);
    } catch (error) {
      console.error('Error extracting text:', error);
      return {} as moofyPO;
    }
  }

  async parsePurchaseOrder(
    pdfDoc: pdfjsLib.PDFDocumentProxy
  ): Promise<moofyPO> {
    const moofyPO: moofyPO = {
      supermarket: '',
      cancellationDate: '',
      sendDate: '',
      items: [],
    };

    const fullPdfDoc: (TextItem | TextMarkedContent)[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      fullPdfDoc.push(...textContent.items);
    }

    moofyPO.sendDate = this.getTextItemStr(fullPdfDoc[14]);
    moofyPO.supermarket = this.getTextItemStr(fullPdfDoc[56]);
    moofyPO.cancellationDate = this.getTextItemStr(fullPdfDoc[18]);
    moofyPO.items = this.getPurchaseOrderItems(fullPdfDoc);

    // console.log('Order:=', moofyPO);

    return moofyPO;
  }

  getPurchaseOrderItems(content: (TextItem | TextMarkedContent)[]): any[] {
    const result = [];
    content = this.getPurchaseOrderTable(content);
    content.map((item: any, rdx: any) => console.log(item.str, rdx));

    const itemsAmount = content.findIndex((item) => {
      if ('str' in item) {
        return item.str === 'Total artic lín';
      }
      return false;
    });

    for (
      let i = 0;
      i < parseInt(this.getTextItemStr(content[itemsAmount + 2]));
      i++
    ) {
      const currentItemIndex = content.findIndex((item) => {
        if ('str' in item) {
          return item.str === `00${i + 1}`;
        }
        return false;
      });

      const item = {
        article: this.getTextItemStr(content[currentItemIndex + 2]),
        quantity: this.getTextItemStr(content[currentItemIndex + 14]),
        cost: this.getTextItemStr(content[currentItemIndex + 20]),
      };

      result.push(item);
    }

    return [...result];
  }

  getPurchaseOrderTable(
    content: (TextItem | TextMarkedContent)[]
  ): (TextItem | TextMarkedContent)[] {
    const itemsIdxStart =
      content.findIndex((item) => {
        if ('str' in item) {
          return item.str === 'Costo Extendí';
        }
        return false;
      }) + 2;
    return content.slice(itemsIdxStart);
  }

  getTextItemStr = (item: unknown): string => {
    if (item && typeof item === 'object' && 'str' in item) {
      return (item as TextItem).str;
    }
    return '';
  };
}
