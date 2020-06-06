import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEventType } from '@angular/common/http';
import { PlaceHeader } from '../models/place-header';
import { Observable } from 'rxjs';
import { API_BASE_PATH } from './api';
import { Place, PlaceKind } from '../models/place';
import { Picture } from '../models/picture';
import { VisitForPlace } from '../models/visit-for-place';
import { MessageIcon } from './message.service';
import { getPictureUrl } from '../stringUtils';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  constructor(private http: HttpClient) { }

  // order = "date" to order by date; default order is alphabetical
  // search - substring to search for in place's name. No case sensitive.
  getPlacesList(order: string|null, take: number|null, skip: number|null,
                search: string|null, kind: PlaceKind[] = null): Observable<PlaceHeader[]> {
    let params = new HttpParams();
    if (order) {
      params = params.set('order', order);
    }
    if (take) {
      params = params.set('take', take.toString());
    }
    if (skip) {
      params = params.set('skip', skip.toString());
    }
    if (search) {
      params = params.set('search', search);
    }
    if (kind && (kind.length > 0)) {
      params = params.set('kind', this.getKindFilterStr(kind));
    }

    return this.http.get<PlaceHeader[]>(`${API_BASE_PATH}/places`, { params: params });
  }

  getPlace(id: number): Observable<Place> {
    return this.http.get<Place>(`${API_BASE_PATH}/place/${id}`)
  }

  createPlace(): Observable<Place> {
    return this.http.post<Place>(`${API_BASE_PATH}/places`, null);
  }

  updatePlace(place: Place): Observable<any> {
    return this.http.put(`${API_BASE_PATH}/place`, place);
  }

  deletePlace(id: number, deleteVisits: boolean) {
    return this.http.delete(`${API_BASE_PATH}/place/${id}${deleteVisits ? "?deleteVisits=true" : ""}`);
  }

  uploadPicture(placeId: number, file: File): Observable<Picture> {
    let formData = new FormData();
    formData.append("picture", file);

    return new Observable<Picture>(observer => {
      this.http.post(`${API_BASE_PATH}/place/${placeId}/gallery`, formData, { reportProgress: true, observe: "events" })
        .subscribe(event => {
          if (event.type == HttpEventType.Response) {
            let result = <Picture>event.body;
            observer.next(result);
            observer?.complete();
          }
        }, error => {
          observer.error(error);
        })
    });
  }

  deletePicture(placeId: number, pictureSmallSizeId: string): Observable<any> {
    return this.http.delete(`${API_BASE_PATH}/place/${placeId}/gallery/${pictureSmallSizeId}`);
  }

  getVisitsForPlace(placeId: number, take: number|null, skip: number|null): Observable<VisitForPlace[]> {
    let params = new HttpParams();
    if (take) {
      params = params.set("take", take.toString());
    }
    if (skip) {
      params = params.set("skip", skip.toString());
    }

    return this.http.get<VisitForPlace[]>(`${API_BASE_PATH}/place/${placeId}/visits`, { params: params });
  }

  //---------- Service area

  getErrorCodeText(errorCode: string): string {
    switch (errorCode) {
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

  getServerErrorText(error: any): string {
    if (error.error) {
      if (typeof error.error == "string") {
        return this.getErrorCodeText(error.error);
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

    return "Communication error";
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

  getDisplayablePlaceName(placeName: string) {
    if (placeName) {
      return placeName;
    } else {
      return "< без имени >";
    }
  }

  getMiniaturePicSrc(place: PlaceHeader) {
    if (place?.titlePictureSmallSizeId) {
      return getPictureUrl(place.titlePictureSmallSizeId, place.titlePictureFormat);
    } else {
      return "/assets/no-pic-place.png";
    }
  }

  getKindFilterStr(placeKinds: PlaceKind[]): string {
    return placeKinds.map(value => {
      if (value === null) {
        return "null";
      } else {
        return PlaceKind[value].toLowerCase();
      }
    }).join("|");
  }

  parseKindFilterStr(str: string): PlaceKind[] {
    let params = str.toLowerCase().split('|').map(s => s.trim());

    let result: PlaceKind[] = [];
    for (let value in PlaceKind) {
      let numericValue = Number(value);
      if (!isNaN(numericValue)
          && params.find(p => p == PlaceKind[value].toLowerCase())) {
        result.push(numericValue);
      }
    }

    if (params.find(p => p == "null")) {
      result.unshift(null);
    }

    return result;
  }

  isAccessibilityApplicable(placeKind: PlaceKind): boolean {
    return placeKind != PlaceKind.TOWN;
  }

  isPopularityApplicable(placeKind: PlaceKind): boolean {
    return placeKind != PlaceKind.TOWN;
  }

  isCapacityApplicable(placeKind: PlaceKind): boolean {
    return (placeKind == null) || (placeKind == PlaceKind.LAKE) || (placeKind == PlaceKind.DAM) || (placeKind == PlaceKind.RIVER);
  }
}
