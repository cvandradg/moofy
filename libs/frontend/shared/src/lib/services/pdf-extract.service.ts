import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  walmartBotLogin() {
    const url = 'http://localhost:3001/walmart-bot-login/';
    const body = {
      username: 'candradeg9182@gmail.com',
      password: 'PastryFactory2024',
      language: 'en',
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Agent': 'AngularApp',
      'X-Bot-Token':
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJsb2dpbklkIjoiY2FuZHJhZGVnOTE4MkBnbWFpbC5jb20iLCJpc3MiOiJrcmFrZW4iLCJleHAiOjE3MzkyMTU0MDksImlhdCI6MTczNDAzMTQwOSwianRpIjoiYTJhNGIxMWYtNjZmMi00YzdlLTk2MTctZjQwOTU4MjFmOTMyIn0.EvVZVyUbeAD540h3zmwNKPi6dDhnjxTneYxKdQULdDlgRoCYfcSWi1og5-3b66kVKL-KNTmSOeeXLu20T1P4ZwwXEAV3nYj7N7V12mlPhHO_3SMdMcMMk_y_ZdpQAdlYKE7zidcTbrYeCvcB0m1mGIyELE_ZnmNrIyB1HbOtHurb8idRXy10D3S5SynXKgztzWDWlyZTnLM-JASAalzab8rvbNDTa3_10qgIzLTgBOsQBzsJyHgpGmtIGRo3rq6RtAs4_mlK-jFG1--QfoXaNxZHx36wToGNIj7s96z2zCMBIK8PRV1ThnfzkEvYl5h3xG3Z8Jy4tvjIzKKJcd7n3w',
    });

    return this.http.post(url, body, { headers });
  }

  fetchInboundDocuments() {
    const url = 'http://localhost:3000/get-inbound-documents'; // Proxy endpoint

    return this.http.get(url);
  }
}
