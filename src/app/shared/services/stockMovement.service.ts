import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Item } from './items.service';
import { Store } from './stores.service';


export interface StockMovement {
    _id?: string;
    type: 'input' | 'output';
    quantity: number;
    purchasePrice?: number;
    item_id: string; // Item ID
    item?: Item; 
    store?: Store;
    movementDate?: string; // ISO date string
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
    private readonly stockMovementUrl = `${environment.apiBaseUrl}/stock-movements`;

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

    // Get all stock movements
    getStockMovements(): Observable<StockMovement[]> {
        return this.http.get<{ success: boolean; stockMovements: StockMovement[] }>(
            `${this.stockMovementUrl}`, { headers: this.getHeaders() }
        ).pipe(
            map(response => response.stockMovements)
        );
    }


    //Handle errors
    private handleError(error: HttpErrorResponse) {
        console.error('An error occurred:', error);
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }

    // Create a new stock movement
    createStock(stockData: Omit<StockMovement, '_id'>): Observable<StockMovement> {
            return this.http.post<StockMovement>(this.stockMovementUrl, stockData, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    // Update an existing stock movement
    updateStock(id: string, stockData: Omit<StockMovement, '_id'>): Observable<StockMovement> {
        return this.http.put<StockMovement>(`${this.stockMovementUrl}/${id}`, stockData, {
        headers: this.getHeaders()
        }).pipe(
        catchError(this.handleError)
        );
    }

    // Delete a stock movement
    deleteStockMovement(id: string): Observable<void> {
        return this.http.delete<void>(`${this.stockMovementUrl}/${id}`, {
        headers: this.getHeaders()
        }).pipe(
        catchError(this.handleError)
        );
    }

}