import { User } from 'firebase/auth';
import { Validators } from '@angular/forms';
import { FirebaseError } from 'firebase/app';

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
