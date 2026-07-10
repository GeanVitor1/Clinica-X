import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly baseUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected buildParams(params: Record<string, string | number | boolean | undefined | null>): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return p;
  }
}
