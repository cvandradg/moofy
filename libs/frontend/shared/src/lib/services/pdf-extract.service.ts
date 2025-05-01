import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
/* @vite-ignore */

interface Item {
  cost: string;
  article: string;
  quantity: string;
}

interface MoofyPO {
  supermarket: string | null;
  cancellationDate: string | null;
  sendDate: string | null;
  items: Item[];
  fileName: string;
}

@Injectable({
  providedIn: 'root',
})
export class PdfExtractService {
  http = inject(HttpClient);

  fetchInboundDocuments() {
    const url = 'http://localhost:3000/get-inbound-documents'; // Proxy endpoint

    return this.http.get(url);
  }

  getInboutOrderDetails(documentId: number, location: string): Observable<any> {
    const url = 'http://localhost:3000/get-inbound-order-details'; // Proxy endpoint
    const params = { documentId: documentId.toString(), location };

    console.log('Inbound Order API PARAMS', params);

    return this.http.get(url, { params });
  }
}
