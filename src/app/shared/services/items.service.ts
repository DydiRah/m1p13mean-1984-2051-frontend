import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category } from './categories.service';
import { Store } from './stores.service';

export interface Item {
  _id?: string;
  name: string;
  description: string;
  price: string | number;
  image_url?: string;
  quantity: number;
  type_stock?: 'LIFO' | 'FIFO';
  category: Category | string;
  store: Store | string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private readonly itemsUrl = `${environment.apiBaseUrl}/items`;

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

  // Get all items
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.itemsUrl, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get single item
  getItem(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.itemsUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Create item (supports photo upload via FormData)
  createItem(item: Item, photo?: File): Observable<Item> {
    const form = new FormData();
    form.append('name', item.name);
    form.append('description', item.description);
    form.append('price', String(item.price));
    form.append('quantity', String(item.quantity));
    form.append('category', typeof item.category === 'string' ? item.category : item.category._id || '');
    form.append('store', typeof item.store === 'string' ? item.store : item.store._id || '');
    if (item.type_stock) {
      form.append('type_stock', item.type_stock);
    }
    if (photo) {
      form.append('photo', photo);
    }    

    return this.http.post<Item>(this.itemsUrl, form, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        console.log('POST response from server:', response);
      }),
      catchError((error) => {
        console.error('❌ Erreur POST items: status=', error.status, 'statusText=', error.statusText, 'url=', error.url);
        console.error('❌ Erreur POST items - raw error object:', error);
        console.error('Response body (object):', error.error);
        try {
          console.error('Response body (stringified):', JSON.stringify(error.error));
        } catch (e) {
          console.error('Could not stringify response body', e);
        }
        return this.handleError(error);
      })
    );
  }

  // Update item (send FormData to match backend expectations)
  updateItem(id: string, item: Item, photo?: File): Observable<Item> {
    const form = new FormData();
    form.append('name', item.name);
    form.append('description', item.description);
    form.append('category', typeof item.category === 'string' ? item.category : item.category._id || '');
    form.append('store', typeof item.store === 'string' ? item.store : item.store._id || '');
    form.append('price', String(item.price));
    form.append('quantity', String(item.quantity));
    if (item.type_stock) {
      form.append('type_stock', item.type_stock);
    }
    if (photo) {
      form.append('photo', photo, photo.name);
    }

    console.log(item);

    try {
      const entries: Array<any> = [];
      for (const e of (form as any).entries()) {
        entries.push([e[0], e[1] instanceof File ? `(File) ${e[1].name}` : e[1]]);
      }
      console.log('📤 PUT /api/items - FormData entries:', entries);
    } catch (e) {
      console.log('📤 PUT /api/items - could not enumerate FormData entries');
    }

    return this.http.put<Item>(`${this.itemsUrl}/${id}`, form, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        console.error('❌ Erreur PUT items: status=', error.status, 'statusText=', error.statusText, 'url=', error.url);
        console.error('❌ Erreur PUT items - raw error object:', error);
        console.error('Response body (object):', error.error);
        try {
          console.error('Response body (stringified):', JSON.stringify(error.error));
        } catch (e) {
          console.error('Could not stringify response body', e);
        }
        return this.handleError(error);
      })
    );
  }

  // Delete item
  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.itemsUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // Prefer a server-provided message when possible
    let errorMessage = 'An unknown error occurred';
    try {
      if (error.error) {
        // If backend returns JSON with { message: '...' }
        if (typeof error.error === 'object' && (error.error as any).message) {
          errorMessage = (error.error as any).message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else {
          errorMessage = `Error Code: ${error.status} - ${error.message}`;
        }
      } else if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      }
    } catch (e) {
      errorMessage = `Error Code: ${error.status} - ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
