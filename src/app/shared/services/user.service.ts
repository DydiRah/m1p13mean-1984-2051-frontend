import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Item } from './items.service';
import { Store } from './stores.service';


export interface User {
  _id?: string;
  email?: string;
  last_name?: string;
  first_name?: string;
  pdp_url?: string;
  role?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
    private readonly userUrl = `${environment.apiBaseUrl}/users`;
    
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

    // Get current user info
    getCurrentUser(): Observable<User> {
    return this.http.get<User>(
        `${this.userUrl}/me`,
        { headers: this.getHeaders() }
    );
    }


    //Handle errors
    private handleError(error: HttpErrorResponse) {
        console.error('An error occurred:', error);
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }


}