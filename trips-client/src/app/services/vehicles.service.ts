import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VehicleHeader } from '../models/vehicle-header';
import { Vehicle } from '../models/vehicle';
import { API_BASE_PATH } from './api';
import { filter, map } from 'rxjs/operators';
import { Picture } from '../models/picture';
import { getPictureUrl } from '../stringUtils';
import { MessageIcon } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  constructor(private http: HttpClient) { }

  getVehiclesList(owners: number[] = null): Observable<VehicleHeader[]> {
    let parametersObj: any = {};
    if (owners && (owners.length > 0)) {
      parametersObj.user = owners.join("|");
    }

    return this.http.get<VehicleHeader[]>(`${API_BASE_PATH}/vehicles`, { params: parametersObj });
  }

  getVehicle(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${API_BASE_PATH}/vehicle/${id}`);
  }

  createVehicle(ownerId: number): Observable<Vehicle> {
    let parametersObj: any = {};
    if (ownerId) {
      parametersObj.owner = ownerId.toString();
    }

    return this.http.post<Vehicle>(`${API_BASE_PATH}/vehicles`, null, { params: parametersObj });
  }

  updateVehicle(vehicle: Vehicle): Observable<any> {
    return this.http.put(`${API_BASE_PATH}/vehicle`, vehicle);
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${API_BASE_PATH}/vehicle/${id}`);
  }

  uploadPicture(vehicleId: number, file: File): Observable<Picture> {
    let formData = new FormData();
    formData.append("picture", file);

    return this.http.post(`${API_BASE_PATH}/vehicle/${vehicleId}/gallery`, formData, { reportProgress: true, observe: "events" }).pipe(
      filter(event => event.type == HttpEventType.Response),
      map(event => <Picture>(<HttpResponse<Object>>event).body)
    );
  }

  deletePicture(vehicleId: number, pictureSmallSizeId: string): Observable<any> {
    return this.http.delete(`${API_BASE_PATH}/vehicle/${vehicleId}/gallery/${pictureSmallSizeId}`);
  }

  //----------------------------

  getMiniatureImgSrc(vehicle: VehicleHeader): string {
    if (vehicle?.titlePictureSmallSizeId) {
      return getPictureUrl(vehicle.titlePictureSmallSizeId, vehicle.titlePictureFormat);
    } else {
      return "/assets/no-pic-vehicle.png";
    }
  }

  getDisplayableVehicleName(vehicle: Vehicle|VehicleHeader) {
    if (vehicle.name) {
      return vehicle.name;
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

    return "Communication пук прр-пшшшшш";
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
