import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User } from './user.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';


// notification.model.ts
export interface Notification {
    _id: string;
    user: User;
    text: string;
    type: string;
    given: boolean;
    createdAt: string;
}
@Injectable({ providedIn: 'root' })
export class NotificationService {
    private readonly notifUrl = `${environment.apiBaseUrl}/notifications`;
    private eventSource!: EventSource;

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
    
    // Get all stock movements
    getNotifications(): Observable<Notification[]> {
        return this.http.get<{ success: boolean; notifications: Notification[] }>(
            `${this.notifUrl}`, { headers: this.getHeaders() }
        ).pipe(
            map(response => response.notifications),
        );
    }

    viewAll(): Observable<Notification[]> {
        return this.http.put<{ success: boolean; notifications: Notification[] }>(
            `${this.notifUrl}`, { headers: this.getHeaders() }
        ).pipe(
            map(response => response.notifications),
        );
    }

    connect(): Observable<any> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token manquant");

        this.eventSource = new EventSource(
        `${this.notifUrl}/stream?token=${token}`
        );

        return new Observable(observer => {
        this.eventSource.onmessage = (event) => {
            observer.next(JSON.parse(event.data));
        };

        this.eventSource.onerror = (err) => {
            console.error("SSE error", err);
            observer.error(err);
            this.eventSource.close();
        };

        return () => this.eventSource.close();
        });
    }
}