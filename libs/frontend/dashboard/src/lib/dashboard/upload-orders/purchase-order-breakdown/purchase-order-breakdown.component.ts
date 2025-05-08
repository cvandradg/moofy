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
}
