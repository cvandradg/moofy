import { inject, Injectable } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { switchMap, Observable, tap } from 'rxjs';
import {
  NothingOr,
  PdfExtractService,
  ComponentStoreMixinHelper,
  moofyPO,
} from '@moofy-admin/shared';

@Injectable()
export class UploadOrdersStore extends ComponentStoreMixinHelper<{
  purchaseOrders: Record<string, typeof moofyPO[]>;
}> {
  pdfExtractService = inject(PdfExtractService);

  constructor() {
    super({ purchaseOrders: {} });
  }

  readonly purchaseOrders$ = this.select((state) => state.purchaseOrders);

  readonly setUser = this.updater((state, purchaseOrders: any) => ({
    ...state,
    loading: false,
    purchaseOrders,
  }));

  readonly extractOrders$ = this.effect((files$: Observable<any>) =>
    files$.pipe(
      this.responseHandler(
        switchMap((files: any) =>
          this.pdfExtractService.extractOrderByRoute(files).pipe(
            tap((x) => console.log('processed files,', x)),
            tapResponse(this.onSuccess, this.onSigninError)
          )
        )
      )
    )
  );

  get onSigninError() {
    return (error: any) => this.handleError(error);
  }

  get onSuccess() {
    return (files: any) => this.setUser(files);
  }
}
