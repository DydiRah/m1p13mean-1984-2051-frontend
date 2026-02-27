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
  adress?: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
    private readonly userUrl = `${environment.apiBaseUrl}/users`;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadCurrentUser();
    }

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

    loadCurrentUser(): void {
        this.getCurrentUser().subscribe({
            next: (user) => {
                this.currentUserSubject.next(user);
            },
            error: (err) => {
            console.warn('Impossible de charger l’utilisateur actuel:', err);
            this.currentUserSubject.next(null);
            }
        });
    }

    getCurrentUser(): Observable<User> {
        return this.http.get<User>(
            `${this.userUrl}/me`,
            { headers: this.getHeaders() }
        ).pipe(
            catchError(this.handleError)
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
    }

    //Handle errors
    private handleError(error: HttpErrorResponse) {
        console.error('An error occurred:', error);
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }

    updateUser(id: string, user: User, photo?: File): Observable<User> {
        const form = new FormData();
        if (user.email) form.append('name', user.email);
        if (user.last_name) form.append('name', user.last_name);
        if (user.first_name) form.append('name', user.first_name);
        if (user.phone) form.append('name', user.phone);
        if (user.adress) form.append('name', user.adress);

        if (photo) {
            form.append('pdp', photo, photo.name);
        }
        return this.http.put<Item>(`${this.userUrl}/${id}`, form, {
                headers: this.getHeaders()
            }).pipe(
            catchError((error) => {
                try {
                    console.error('Response body (stringified):', JSON.stringify(error.error));
                } catch (e) {
                    console.error('Could not stringify response body', e);
                }
                return this.handleError(error);
            })
        );
    }

    getStoreUsers() {
        return this.http.get<any[]>(
            `${this.userUrl}/storesUsers`,
            { headers: this.getHeaders() }
        );
    }
}