import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './user.service';
import { environment } from '../../../environments/environment';


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