import { MODULES } from '@moofy-admin/shared';
import { ChangeDetectionStrategy, Component, computed, Input, Signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';

type inboundOrder = {
  AckStatusCode: string | null;
  AckStatusDescription: string | null;
  AifNumber: string | null;
  ApprovalTimestamp: string;
  Country: string | null;
  CreatedTimestamp: string;
  DocSplitInd: string;
  DocType: string;
  DocumentCountry: string;
  DocumentId: number;
  DocumentNumber: string;
  DocumentOpenedIndicator: string;
  DocumentStatusCode: number;
  DocumentTypeCode: number;
  EditType: string | null;
  Location: string;
  MailboxId: number;
  MailboxSystemSeparator: string | null;
  OrderDate: string;
  PdfRequestIconDisplay: string | null;
  PdfRequestJsonDetail: string | null;
  PdfStatus: string | null;
  RelatedDocumentCount: number;
  TaSlipNumber: string;
  TaSplitInd: string;
  TotalRows: number;
  TradRelId: string | null;
  VendorName: string | null;
  VendorNumber: number;
  WebEdiSetupId: string | null;
  XmlPath: string | null;
};

type PurchaseOrdeDetails = {
  purchaseOrderNumber: string;
  purchaseOrderDate: string;
  shipDate: string;
  cancelDate: string;
  additionalDetails: {
    orderType: string;
    currency: string;
    department: string;
    paymentTerms: string;
    carrier: string;
    shipTo: string;
    billTo: string;
  };
  items: {
    line: string;
    itemNumber: string;
    gtin: string;
    supplierStock: string;
    color: string;
    size: string;
    quantityOrdered: string;
    uom: string;
    pack: string;
    cost: string;
    extendedCost: string;
  }[];
  totals: {
    totalAmount: string;
    totalItems: string;
    totalUnits: string;
  };
};

const ELEMENT_DATA: any[] = [
  { position: 1, name: 'Hydrogen', quantity: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', quantity: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', quantity: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', quantity: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', quantity: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', quantity: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', quantity: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', quantity: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', quantity: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', quantity: 20.1797, symbol: 'Ne' },
  { position: 11, name: 'Sodium', quantity: 22.9897, symbol: 'Na' },
  { position: 12, name: 'Magnesium', quantity: 24.305, symbol: 'Mg' },
  { position: 13, name: 'Aluminum', quantity: 26.9815, symbol: 'Al' },
  { position: 14, name: 'Silicon', quantity: 28.0855, symbol: 'Si' },
  { position: 15, name: 'Phosphorus', quantity: 30.9738, symbol: 'P' },
  { position: 16, name: 'Sulfur', quantity: 32.065, symbol: 'S' },
  { position: 17, name: 'Chlorine', quantity: 35.453, symbol: 'Cl' },
  { position: 18, name: 'Argon', quantity: 39.948, symbol: 'Ar' },
  { position: 19, name: 'Potassium', quantity: 39.0983, symbol: 'K' },
  { position: 20, name: 'Calcium', quantity: 40.078, symbol: 'Ca' },
];

@Component({
  selector: 'moofy-purchase-order-breakdown',
  imports: [MODULES, MatTableModule],
  templateUrl: './purchase-order-breakdown.component.html',
  styleUrl: './purchase-order-breakdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderBreakdownComponent {
  @Input({ required: true }) purchaseOrder!: Signal<inboundOrder>;
  @Input({ required: true }) purchaseOrderDetails$!: PurchaseOrdeDetails;

  displayedColumns: string[] = ['name', 'quantity'];
  dataSource = ELEMENT_DATA;

  // Use the signal reactively to compute derived data
}
