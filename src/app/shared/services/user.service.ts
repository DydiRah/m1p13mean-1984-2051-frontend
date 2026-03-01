import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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
  notification?: any[]
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
    private readonly userUrl = `${environment.apiBaseUrl}/users`;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        const token = localStorage.getItem('token');
        if (token) {
            this.loadCurrentUser().subscribe({
                error: () => this.logout() // si token invalide
            });
        }
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

    loadCurrentUser(): Observable<User> {
        return this.getCurrentUser().pipe(
            map(user => {
                this.currentUserSubject.next(user);
                return user;   
            }),
            catchError(err => {
            this.currentUserSubject.next(null);
            return throwError(() => err);
            })
        );
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
        if (user.email) form.append('email', user.email);
        if (user.last_name) form.append('last_name', user.last_name);
        if (user.first_name) form.append('first_name', user.first_name);
        if (user.phone) form.append('phone', user.phone);
        if (user.adress) form.append('adress', user.adress);

        if (photo) {
            form.append('pdp', photo, photo.name);
        }
        console.log(id);
        
        return this.http.put<User>(`${this.userUrl}/${id}`, form, {
                headers: this.getHeaders()
            }).pipe(
            tap(() => {
                this.loadCurrentUser().subscribe({
                    error: (err) => {
                    console.error('Erreur lors du chargement de l’utilisateur', err);
                    }
                });
            }),
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