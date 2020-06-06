import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { TripHeader } from '../models/trip-header';
import { Trip } from '../models/trip';
import { Picture } from '../models/picture';
import { dateToQueryParamString } from '../stringUtils';
import { API_BASE_PATH } from './api';

@Injectable({
  providedIn: 'root'
})
export class TripsService {
  constructor(private http: HttpClient) { }

  getTripsList(take: number, skip: number, search: string, from: Date, to: Date): Observable<TripHeader[]> {
    let params = new HttpParams();
    if (take) {
      params = params.set("take", take.toString());
    }
    if (skip) {
      params = params.set("skip", skip.toString());
    }
    if (search) {
      params = params.set("search", search);
    }
    if (from) {
      params = params.set("from", dateToQueryParamString(from));
    }
    if (to) {
      params = params.set("to", dateToQueryParamString(to));
    }

    return this.http.get<TripHeader[]>(`${API_BASE_PATH}/trips`, { params: params });
  }

  getTrip(id: number): Observable<Trip> {
    return this.http.get<Trip>(`${API_BASE_PATH}/trip/${id}`);
  }

  createTrip(placeId: number): Observable<Trip> {
    return this.http.post<Trip>(`${API_BASE_PATH}/trips`, null, { params: { placeId: placeId.toString() }})
  }

  updateTrip(trip: Trip): Observable<any> {
    return this.http.put<Trip>(`${API_BASE_PATH}/trip`, trip);
  }

  deleteTrip(id: number): Observable<any> {
    return this.http.delete(`${API_BASE_PATH}/trip/${id}`);
  }

  uploadPicture(tripId: number, file: File): Observable<Picture> {
    let formData = new FormData();
    formData.append("picture", file);

    return this.http.post(`${API_BASE_PATH}/trip/${tripId}/gallery`, formData, { reportProgress: true, observe: "events" }).pipe(
      filter(event => event.type == HttpEventType.Response),
      map(event => <Picture>(<HttpResponse<Object>>event).body)
    );
  }

  deletePicture(tripId: number, pictureSmallSizeId: string): Observable<any> {
    return this.http.delete(`${API_BASE_PATH}/trip/${tripId}/gallery/${pictureSmallSizeId}`);
  }

  addParticipant(tripId: number, userId: number): Observable<any> {
    return this.http.post(`${API_BASE_PATH}/trip/${tripId}/participants`, null, { params: { userId: userId.toString() }});
  }

  removeParticipant(tripId: number, userId: number): Observable<any> {
    return this.http.delete(`${API_BASE_PATH}/trip/${tripId}/participant/${userId}`);
  }

  addVisit(tripId: number, placeId: number): Observable<any> {
    return this.http.post(`${API_BASE_PATH}/trip/${tripId}/visits?placeId=${placeId}`, null);
  }

  removeVisit(tripId: number, visitId: number): Observable<any> {
    return this.http.delete(`${API_BASE_PATH}/trip/${tripId}/visit/${visitId}`);
  }

  uploadVisitPicture(tripId: number, visitId: number, file: File): Observable<Picture> {
    let formData = new FormData();
    formData.append("picture", file);

    return this.http.post(`${API_BASE_PATH}/trip/${tripId}/visit/${visitId}/gallery`, formData, { reportProgress: true, observe: "events" }).pipe(
      filter(event => event.type == HttpEventType.Response),
      map(event => <Picture>(<HttpResponse<Object>>event).body)
    );
  }

  deleteVisitPicture(tripId: number, visitId: number, pictureSmallSizeId: string): Observable<any> {
    return this.http.delete(`${API_BASE_PATH}/trip/${tripId}/visit/${visitId}/gallery/${pictureSmallSizeId}`);
  }
}
