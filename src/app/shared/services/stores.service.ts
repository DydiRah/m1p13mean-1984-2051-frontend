import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';




export interface Store {
  _id?: string;
  name: string;
  description: string;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class StoresService {
  private readonly storeUrl = `${environment.apiBaseUrl}/stores`;

  
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('Token envoyé:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('Aucun token trouvé dans localStorage');
    }

    return headers;
  }

    // Get all stores
    getStores(): Observable<Store[]> {
        return this.http.get<{ success: boolean; stores: Store[] }>(
            `${this.storeUrl}`, { headers: this.getHeaders() }
        ).pipe(
            map(response => response.stores)
        );
    }


}
