import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Item } from './items.service';
import { Store } from './stores.service';
import { StockMovement } from './stockMovement.service';
import { User } from './user.service';


export interface Order {
    _id?: string;
    orderDate: Date;
    status: string;
    total: number;
    paymentMethod: string;
    // Relations
    owner: User,
    // Embedded
    items: [
        {
            item: Item,
            quantity: number,
            subTotal: number
        }
    ],
    invoice: {
        fileName: string,
        pdf: string,
        date: Date
    }
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
    private readonly orderUrl = `${environment.apiBaseUrl}/orders`;

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        let headers = new HttpHeaders();

        if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
        } else {
        console.warn('Aucun token trouvé dans localStorage');
        }

        return headers;
    }

    // Get all orders
    getOrders(statut: string): Observable<Order[]> {
        const params: any = {};
        if (statut) params.statut = statut;
        return this.http.get<{ success: boolean; orders: Order[] }>(
            `${this.orderUrl}`, { headers: this.getHeaders(), params }
        ).pipe(
            map(response => response.orders)
        );
    }

    addToCart(details: any[]): Observable<Order> {        
        return this.http.post<Order>(
            `${this.orderUrl}/cart/add`,
            { items_details: details },        
            { headers: this.getHeaders() }
        );
    }

    checkout(paymentMethod: string): Observable<Order> {        
        return this.http.post<Order>(
            `${this.orderUrl}/checkout`,
            { paymentMethod: paymentMethod },        
            { headers: this.getHeaders() }
        );
    }


    //Handle errors
    private handleError(error: HttpErrorResponse) {
        console.error('An error occurred:', error);
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }


}