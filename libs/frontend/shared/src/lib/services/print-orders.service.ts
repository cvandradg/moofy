import { Injectable } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import * as pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

interface PurchaseOrder {
  DocumentId: string;
  purchaseOrderNumber: string;
  purchaseOrderDate: Date | any;
  shipDate: Date | any;
  cancelDate: Date | any;
  location: string;
  additionalDetails: {
    Carrier: string;
    Currency: string;
    Department: string;
    'Order Type': string;
    'Payment Terms': string;
  };
  items: Array<{
    line: string;
    itemNumber: string;
    quantityOrdered: string;
    extendedCost: string;
  }>;
  totals: {
    totalItems: string;
    totalUnits: string;
    totalAmount: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PrintOrdersService {
  /**
   * Generates a single PDF containing one page per PurchaseOrder
   * @param purchaseOrders array of PurchaseOrder objects
   */
  generatePurchaseOrdersPDF(purchaseOrders: PurchaseOrder[]) {
    console.log('🔥 generatePurchaseOrdersPDF called with', purchaseOrders.length, 'items');

    const fmt = (d: any): string => {
      let date: Date;
      if (d instanceof Timestamp || (d?.toDate && typeof d.toDate === 'function')) {
        date = d.toDate();
      } else if (typeof d === 'string' || typeof d === 'number') {
        date = new Date(d);
      } else if (d instanceof Date) {
        date = d;
      } else {
        console.warn('Unrecognized date value:', d);
        return '';
      }
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // Build the content array, inserting a pageBreak before each PO except the first
    const content = purchaseOrders.flatMap((po, idx) => {
      const pageBreak = idx > 0 ? { text: '', pageBreak: 'before' } : null;
      const header = { text: `Purchase Order: ${po.purchaseOrderNumber}`, style: 'title' };
      const info = {
        columns: [
          [
            { text: `Document ID: ${po.DocumentId}` },
          ],
          [
            { text: `PO Date: ${fmt(po.purchaseOrderDate)}`, alignment: 'right' },
            { text: `Ship Date: ${fmt(po.shipDate)}`, alignment: 'right' },
            { text: `Cancel Date: ${fmt(po.cancelDate)}`, alignment: 'right' },
          ],
        ],
      };
      const locationText = { text: `Supercenter ${po.location}`, margin: [0, 10, 0, 10] };
      const detailsTitle = { text: 'Details', style: 'header' };
      const detailsTable = {
        table: {
          widths: ['auto', '*'],
          body: Object.entries(po.additionalDetails).map(([k, v]) => [
            { text: k, bold: true, fontSize: 8 },
            { text: v, fontSize: 8 },
          ]),
        },
        layout: 'lightHorizontalLines',
      };
      const itemsTitle = { text: 'Items', style: 'header', margin: [0, 10, 0, 5] };

      const validItems = po.items.filter((i) => !isNaN(Number(i.line)));

      const itemsTable = {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: [
            [
              { text: 'Line', style: 'tableHeader' },
              { text: 'Item #', style: 'tableHeader' },
              { text: 'Quantity', style: 'tableHeader' },
              { text: 'Ext. Cost', style: 'tableHeader' },
            ],
            ...validItems.map((i) => [
              { text: i.line, style: 'tableRow' },
              { text: i.itemNumber, style: 'tableRow' },
              { text: i.quantityOrdered, style: 'tableRow' },
              { text: i.extendedCost, style: 'tableRow' },
            ]),
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          paddingTop: () => 2,
          paddingBottom: () => 2,
        },
        fontSize: 8,
      };
      const totalsTable = {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              body: [
                [
                  { text: 'Total Items:', bold: true, fontSize: 8 },
                  { text: po.totals.totalItems, fontSize: 8 },
                ],
                [
                  { text: 'Total Units:', bold: true, fontSize: 8 },
                  { text: po.totals.totalUnits, fontSize: 8 },
                ],
                [
                  { text: 'Total Amount:', bold: true, fontSize: 8 },
                  { text: po.totals.totalAmount, fontSize: 8 },
                ],
              ],
            },
            layout: 'noBorders',
          },
        ],
        margin: [0, 10, 0, 0],
      };

      return [
        ...(pageBreak ? [pageBreak] : []),
        header,
        info,
        locationText,
        detailsTitle,
        detailsTable,
        itemsTitle,
        itemsTable,
        totalsTable,
      ];
    });

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content,
      styles: {
        title: { fontSize: 20, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 5, 0, 5] },
        header: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
        tableHeader: { fontSize: 10, bold: true, fillColor: '#eeeeee', margin: [0, 2, 0, 2] },
        tableRow: { fontSize: 7, margin: [0, 1, 0, 1] },
      },
    };

    pdfMake.createPdf(docDefinition).download('purchase-orders.pdf');
  }
}
