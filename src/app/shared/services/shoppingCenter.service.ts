import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ShoppingCenter {
  _id?: string;
  name: string;
  adresse: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingCenterService {
  private readonly apiUrl = `${environment.apiBaseUrl}/shopping-centers`;

  constructor(private http: HttpClient) {}

  getSingleShoppingCenter(): Observable<any> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/single`, { headers });
  }
}