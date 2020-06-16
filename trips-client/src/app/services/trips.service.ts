import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { TripHeader } from '../models/trip-header';
import { Trip } from '../models/trip';
import { Picture } from '../models/picture';
import { dateToQueryParamString, getPictureUrl } from '../stringUtils';
import { API_BASE_PATH } from './api';
import { MessageIcon } from './message.service';
import { FilterOperation } from '../models/filter-operation';

@Injectable({
  providedIn: 'root'
})
export class TripsService {
  constructor(private http: HttpClient) { }

  getTripsList(take: number, skip: number, search: string, from: Date, to: Date,
      userFilter: number[] = null, userFilterOperation: FilterOperation = FilterOperation.OR,
      placeFilter: number[] = null, placeFilterOperation: FilterOperation = FilterOperation.OR): Observable<TripHeader[]> {
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
    if (userFilter && (userFilter.length > 0)) {
      let paramValue = (userFilterOperation == FilterOperation.AND) ? userFilter.join("&") : userFilter.join("|");
      params = params.set("users", paramValue);
    }
    if (placeFilter && (placeFilter.length > 0)) {
      let paramValue = (placeFilterOperation == FilterOperation.AND) ? placeFilter.join("&") : placeFilter.join("|");
      params = params.set("places", paramValue);
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

  //-------------------------------------

  getMiniatureImgSrc(trip: TripHeader): string {
    if (trip?.titlePictureSmallSizeId) {
      return getPictureUrl(trip.titlePictureSmallSizeId, trip.titlePictureFormat);
    } else {
      return "/assets/no-pic-trip.png";
    }
  }

  getDisplayableTripTitle(trip: Trip|TripHeader) {
    if (trip.title) {
      return trip.title;
    } else {
      return "< без названия >"
    }
  }

  getServerErrorText(error: any): string {
    if (error.error) {
      if (typeof error.error == "string") {
        return this.getBadRequestErrorText(error.error);
      } else if (error.error.errors && error.error.errors.id && Array.isArray(error.error.errors.id)) {
        return error.error.errors.id.join("\r\n");
      }
    }

    if (error.status == 404) {
      return "Не найдено в БД. Возможно, кто-то параллельно уже удолил.";
    } else if (error.status == 401) {
      return "Вы не авторизованы";
    } else if (error.status == 403) {
      return "Нет прав для осуществления операции.";
    } else if (error.status == 423) {
      return "Данное действие нельзя произвести по техническим причинам.\r\nНа время проведения важных работ сайт переведен админом в режим только чтение.";
    } else if (error.status == 0) {
      return "Сервер не отвечает";
    }

    return "Communism error";
  }

  getServerErrorIcon(error: any): MessageIcon {
    if (error.error) {
      if (typeof error.error == "string") {
        if ((error.error == "SMALL_PICTURE")
            || (error.error == "CROOKED_PICTURE")) {
          return MessageIcon.smallImage;
        }
      }
    }

    return MessageIcon.error;
  }

  private getBadRequestErrorText(badRequestErrorCode: string): string {
    switch (badRequestErrorCode) {
      case "MISSING_PARAMS":
        return "Не переданы обязательные параметры запроса надлежащим образом (ошибка в программе)";
      case "NO_FILE":
        return "Не указан файл";
      case "FILE_EMPTY":
        return "Файл - пустой";
      case "FILE_TOO_LARGE":
        return "Файл слишком большой. Максимальный разрешённый размер - 16 МБ.";
      case "FILE_NOT_SUPPORTED":
        return "Формат файла не поддерживается.";
      case "SMALL_PICTURE":
        return "Слишком крохотная картинка для галереи. Почти как мой член. У-тю-тю-тю-тю! Минимум надо 200x200 пикселей.";
      case "CROOKED_PICTURE":
        return "Потребность в картинках с несуразными пропорциями ширины/высоты реально составляет ноль штук.";
    }
  }
}
