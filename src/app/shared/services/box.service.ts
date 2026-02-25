import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Box {
  _id?: string;
  size: number;
  price: number;
  status: 'available' | 'occupied';
  shopping_center: string | null;   
  price_history: number[];          
  createdAt?: string;               
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BoxesService {

  private readonly boxesUrl = `${environment.apiBaseUrl}/boxes`;

  constructor(private http: HttpClient) {}

  // Headers avec JWT
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // GET ALL BOXES
  getBoxes(): Observable<Box[]> {
      return this.http.get<{ success: boolean; stockMovements: Box[] }>(
          `${this.boxesUrl}`, { headers: this.getHeaders() }
      ).pipe(
          map(response => response.stockMovements)
      );
  }

  // GET SINGLE BOX
  getBox(id: string): Observable<Box> {
    return this.http.get<Box>(`${this.boxesUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // CREATE BOX
  createBox(box: Box): Observable<Box> {
    return this.http.post<Box>(this.boxesUrl, box, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('Box created:', response)),
      catchError(this.handleError)
    );
  }

  // UPDATE BOX
  updateBox(id: string, box: Box): Observable<Box> {
    return this.http.put<Box>(`${this.boxesUrl}/${id}`, box, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('Box updated:', response)),
      catchError(this.handleError)
    );
  }

  // DELETE BOX
  deleteBox(id: string): Observable<void> {
    return this.http.delete<void>(`${this.boxesUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Gestion centralisée des erreurs
  private handleError(error: HttpErrorResponse) {

    let errorMessage = 'Une erreur inconnue est survenue';

    if (error.error) {
      if (typeof error.error === 'object' && (error.error as any).message) {
        errorMessage = (error.error as any).message;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = `Error Code: ${error.status} - ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}