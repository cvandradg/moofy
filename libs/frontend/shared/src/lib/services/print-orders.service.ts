import { Injectable } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import * as pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import { moofyToWalmartRoutes } from './moofy-to-walmart-routes';

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
  private readonly locationToRoute: Record<string, number> = Object.entries(moofyToWalmartRoutes).reduce(
    (acc, [routeKey, stops]) => {
      const num = Number(routeKey);
      stops.forEach((stop) => (acc[stop.name] = num));
      return acc;
    },
    {} as Record<string, number>
  );

  // 2) expose a method that just looks up the route
  getRouteForLocation(location: string): number | undefined {
    return this.locationToRoute[location];
  }

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

    const content = purchaseOrders.flatMap((po, idx) => {
      const pageBreak = idx > 0 ? { text: '', pageBreak: 'before' } : null;
      const header = { text: `Purchase Order: ${po.purchaseOrderNumber}`, style: 'title' };
      const info = {
        columns: [
          [
            { text: `Supercenter ${po.location}`, margin: [0, 8, 0, 0], style: 'subheader' },
            { text: `Document ID: ${po.DocumentId}`, style: 'subheader' },
          ],
          [
            { text: `Route ${this.getRouteForLocation(po.location)}`, alignment: 'right', fontSize: 9 },
            { text: `PO Date: ${fmt(po.purchaseOrderDate)}`, alignment: 'right', fontSize: 9 },
            { text: `Ship Date: ${fmt(po.shipDate)}`, alignment: 'right', fontSize: 9 },
            { text: `Cancel Date: ${fmt(po.cancelDate)}`, alignment: 'right', fontSize: 9 },
          ],
        ],
      };

      // Details section
      const detailsTitle = { text: 'Details', fontSize: 11, bold: true, margin: [0, 8, 0, 3] };
      const detailsTable = {
        table: {
          widths: ['auto', '*'],
          body: Object.entries(po.additionalDetails).map(([k, v]) => [
            { text: k, bold: true, fontSize: 7, margin: [0, 1, 0, 1] },
            { text: v, fontSize: 7, margin: [0, 1, 0, 1] },
          ]),
        },
        layout: 'lightHorizontalLines',
      };

      // Totals only table for side-by-side
      const totalsOnlyTable = {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Total Items:', bold: true, fontSize: 9, margin: [0, 1, 0, 1] },
              { text: po.totals.totalItems, fontSize: 9, margin: [0, 1, 0, 1], alignment: 'right' },
            ],
            [
              { text: 'Total Units:', bold: true, fontSize: 9, margin: [0, 1, 0, 1] },
              { text: po.totals.totalUnits, fontSize: 9, margin: [0, 1, 0, 1], alignment: 'right' },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 2, 0, 0], // reduced top margin to bring table closer
      };

      // Combine details and totals side by side
      const detailsAndTotals = {
        columns: [
          { width: '40%', stack: [detailsTitle, detailsTable] },
          {
            width: '*',
            stack: [
              { text: 'Totals', style: 'header', margin: [0, 6, 0, 1], alignment: 'right' }, // reduced margins
              totalsOnlyTable,
            ],
            alignment: 'right',
          },
        ],
        columnGap: 10,
      };

      // Items section
      const itemsTitle = { text: 'Items', style: 'header', margin: [0, 8, 0, 4] };
      const validItems = po.items.filter((i) => !isNaN(Number(i.line)));
      const itemsTable = {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: [
            [
              { text: 'Line', style: 'tableHeader' },
              { text: 'Item #', style: 'tableHeader' },
              { text: 'Qty', style: 'tableHeader' },
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
          hLineWidth: () => 0.3,
          vLineWidth: () => 0.3,
          paddingTop: () => 1,
          paddingBottom: () => 1,
        },
        fontSize: 6,
      };

      return [...(pageBreak ? [pageBreak] : []), header, info, detailsAndTotals, itemsTitle, itemsTable];
    });

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [30, 50, 30, 50],
      content,
      styles: {
        title: { fontSize: 18, bold: true, margin: [0, 0, 0, 8] },
        subheader: { fontSize: 12, bold: true, margin: [0, 4, 0, 4] },
        header: { fontSize: 14, bold: true, margin: [0, 8, 0, 4] },
        tableHeader: { fontSize: 8, bold: true, fillColor: '#eeeeee', margin: [0, 1, 0, 1] },
        tableRow: { fontSize: 8, margin: [0, 0.5, 0, 0.5] },
      },
    };

    pdfMake.createPdf(docDefinition).download('purchase-orders.pdf');
  }
}
