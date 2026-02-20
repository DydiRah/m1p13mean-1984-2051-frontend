import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';


export interface Category {
  _id?: string;
  name: string;
}

@Injectable({
    providedIn: 'root'
})
export class CategoriesService {
  private readonly categoryUrl = `${environment.apiBaseUrl}/categories`;

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

    // Get all categories
    getCategories(): Observable<Category[]> {
        return this.http.get<{ success: boolean; categories: Category[] }>(
            `${environment.apiBaseUrl}/categories`, { headers: this.getHeaders() }
        ).pipe(
            map(response => response.categories)
        );
    }

    //handle errors
    private handleError(error: HttpErrorResponse) {
        console.error('An error occurred:', error);
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }

}