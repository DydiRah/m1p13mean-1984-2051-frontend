import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Box } from './box.service';
import { Store } from './stores.service';


export interface Contract {
  _id?: string;

  file: string;

  box?: {
    _id: string;
    name?: string;
  } | string;

  store?: {
    _id: string;
    name?: string;
  } | string;

  periods: ContractPeriod[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContractPeriod {
  startDate: Date;
  endDate: Date;

  payment_status:
    | 'paid'
    | 'unpaid'
    | 'pending';
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  private readonly contractUrl =
    `${environment.apiBaseUrl}/contracts`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  createContract(boxId: string, data: any, file: File): Observable<any> {
    const formData = new FormData();

    formData.append("storeId", data.storeId);
    formData.append(
      "startDateLocation",
      new Date(data.startDateLocation).toISOString()
    );

    formData.append(
      "endDateLocation",
      new Date(data.endDateLocation).toISOString()
    );

    formData.append("file", file);

    return this.http.post(
      `${this.contractUrl}/${boxId}`,
      formData,
      {
        headers: this.getHeaders()
      }
    );
  }

  getContractsHistory(boxId: string): Observable<Contract[]> {
    return this.http.get<Contract[]>(
      `${this.contractUrl}/${boxId}/contracts-history`,
      {
        headers: this.getHeaders()
      }
    );
  }

  getCurrentContract(boxId: string): Observable<Contract> {
    return this.http.get<Contract>(
      `${this.contractUrl}/${boxId}/current-contract`,
      {
        headers: this.getHeaders()
      }
    );
  }

  payNextPeriod(contractId: string): Observable<any> {
    return this.http.put(
      `${this.contractUrl}/${contractId}/pay`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }

  terminateContract(contractId: string, terminationDate: Date): Observable<any> {
    return this.http.put(
      `${this.contractUrl}/${contractId}/terminate`,
      {
        terminationDate
      },
      {
        headers: this.getHeaders()
      }
    );
  }
} 