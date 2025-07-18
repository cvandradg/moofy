import { Validators } from '@angular/forms';
import { FirebaseError } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';

export const validations = (...validators: any[]) => [
  '',
  [Validators.required, Validators.min(5), Validators.max(30), ...validators],
];

export const deepCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj || ''));
};

export type Credentials = {
  user: string;
  pass: string;
};

export type AppError = {
  status: boolean;
  message: string;
  error: Error;
};

export interface BaseComponentState extends Record<string, unknown> {
  error: AppError | null;
  loading: boolean;
}

export interface AngularFireError extends Error {
  rejection: FirebaseError;
}

export type NothingOr<T> = T | null | undefined;

export const emptyCallback: () => void = () => {
  return;
};

interface moofyPOItems {
  article: string;
  quantity: string;
  cost: string;
}

export interface moofyPO {
  supermarket: string;
  cancellationDate: string;
  sendDate: string;
  items: moofyPOItems[];
}

export interface PurchaseOrder {
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

export interface InboundDocument {
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
  PdfRequestJsonDetail: any | null;
  PdfStatus: string | null;
  RelatedDocumentCount: number;
  TaSlipNumber: string;
  TaSplitInd: string;
  TotalRows: number;
  TradRelId: string | null;
  VendorName: string | null;
  VendorNumber: number;
  WebEdiSetupId: number | null;
  XmlPath: string;
  createdAtTs: Timestamp;
}
