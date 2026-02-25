import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from './user.service';

export interface Store {
  _id?: string;
  name: string;
  description: string;
  manager: User | string;
}

@Injectable({
  providedIn: 'root'
})
export class StoresService {

  private readonly storeUrl = `${environment.apiBaseUrl}/stores`;

  constructor(private http: HttpClient) {}

  // JWT Headers
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // Gestion erreur globale
  private handleError(error: HttpErrorResponse) {
    return throwError(() => error?.error || { message: 'Server error' });
  }

  // Get all stores
  getStores(): Observable<Store[]> {
    return this.http.get<{ success: boolean; stores: Store[] }>(
      this.storeUrl,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.stores),
      catchError(this.handleError)
    );
  }

  // Get single store
  getStore(id: string): Observable<Store> {
    return this.http.get<Store>(
      `${this.storeUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Create store
  createStore(store: Store): Observable<Store> {
    return this.http.post<Store>(
      this.storeUrl,
      store,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update store
  updateStore(id: string, store: Store): Observable<Store> {
    return this.http.put<Store>(
      `${this.storeUrl}/${id}`,
      store,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete store
  deleteStore(id: string): Observable<any> {
    return this.http.delete(
      `${this.storeUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}