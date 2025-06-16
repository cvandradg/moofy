import { Router } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { Directive, inject } from '@angular/core';
import { AppError } from '../types/general-types';
import { OperatorFunction, pipe, tap } from 'rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { ErrorHandlerService } from '../services/error-handler.service';

export interface GenericState extends Record<string, unknown> {
  error?: AppError | null;
  loading?: boolean;
}

@Directive()
export class ComponentStoreMixinHelper<T extends GenericState> extends ComponentStore<T> {
  router = inject(Router);
  errorHelperService = inject(ErrorHandlerService);

  readonly error$ = this.select((state) => state.error);
  readonly loading$ = this.select((state) => state.loading);

  readonly setLoading = this.updater((state, loading: boolean) => ({
    ...state,
    loading,
  }));

  readonly setError = this.updater((state, error: AppError | null) => ({
    ...state,
    loading: false,
    error,
  }));

  get handleFirebaseError() {
    return (error: FirebaseError) => {
      return this.setError(this.errorHelperService.firebaseErrorHandler(error));
    };
  }

  responseHandler(operator: OperatorFunction<any, any>) {
    return pipe(this.onRequest, operator, this.onResponse);
  }

  get onResponse() {
    return tap<any>(() => {
      this.setError(null);
      this.setLoading(false);
    });
  }

  get onRequest() {
    return tap<any>(() => {
      this.setError(null);
      this.setLoading(true);
    });
  }
}
