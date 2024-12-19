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
