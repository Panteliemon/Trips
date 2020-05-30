import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceOperation } from '../models/service-operation';
import { API_BASE_PATH } from './api';
import { ServiceOperationStatus } from '../models/service-operation-status';
import { ServiceOperationStartResult } from '../models/service-operation-start-result';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor(private http: HttpClient) { }

  getOperationsList(): Observable<ServiceOperation[]> {
    return this.http.get<ServiceOperation[]>(`${API_BASE_PATH}/service/list`);
  }

  startOperation(key: string): Observable<ServiceOperationStartResult> {
    return this.http.post<ServiceOperationStartResult>(`${API_BASE_PATH}/service/start`, null, { params: { key: key }});
  }

  getCurrentStatus(): Observable<ServiceOperationStatus> {
    return this.http.get<ServiceOperationStatus>(`${API_BASE_PATH}/service/status`);
  }

  takeLatestOutput(): Observable<string> {
    return this.http.post<string>(`${API_BASE_PATH}/service/takeoutput`, null, { responseType: "text" as "json" });
  }

  cancelCurrentOperation(): Observable<boolean> {
    return this.http.post<boolean>(`${API_BASE_PATH}/service/cancel`, null);
  }

  //----------

  getServerErrorText(error: any): string {
    if (error.status == 403) {
      return "Недостаточно прав, вы не админ.";
    } else if (error.status == 404) {
      return "Операция, которую вы пытаетесь запустить, отсутствует на сервере. Хз как это произошло. Попробуйте F5.";
    } else if (error.status == 401) {
      return "Вы не авторизованы";
    } else if (error.status === 0) {
      return "Сервер не отвечает";
    }

    // Errors from aspnet core
    if (error.error && error.error.errors && error.error.errors.id && Array.isArray(error.error.errors.id)) {
        return error.error.errors.id.join("\r\n");
    }

    return "Неизвестная ошибка от сервера";
  }
}
