import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { API_BASE_PATH } from "./api";
import { User } from "../models/user";
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { UploadProgress } from './upload-progress';
import { UserHeader } from '../models/user-header';
import { isAllSpaces, getPictureUrl } from '../stringUtils';
import { PicFormat } from '../models/picture';

export function userPicSrc(pictureId: string, format: PicFormat) {
  if (pictureId) {
      return getPictureUrl(pictureId, format);
  } else {
      return "/assets/no-pic-user.png";
  }
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<UserHeader[]> {
    return this.http.get<UserHeader[]>(API_BASE_PATH + "/users");
  }

  getUsersExact(userIds: number[]): Observable<UserHeader[]> {
    let paramValue = userIds.join("|");
    return this.http.get<UserHeader[]>(API_BASE_PATH + "/users", { params: { exact: paramValue }});
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(API_BASE_PATH + `/user/${id}/full`);
  }

  getUserHeaderById(id: number): Observable<UserHeader> {
    return this.http.get<User>(API_BASE_PATH + `/user/${id}`);
  }

  getUserByName(userName: string): Observable<UserHeader> {
    return this.http.get<User>(API_BASE_PATH + `/user/name=${encodeURIComponent(userName)}`);
  }

  createNewUser(userName: string, password: string): Observable<any> {
    let formData = new FormData();
    formData.append("userName", userName ? userName : "");
    formData.append("userPassword", password ? password : "");

    return this.http.post(API_BASE_PATH + "/user/new", formData);
  }

  updateUser(user: User): Observable<any> {
    return this.http.put<User>(API_BASE_PATH + "/user/update", user);
  }

  // For users to change their own passwords
  changeUserPassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    let formData = new FormData();
    formData.append("oldPassword", oldPassword ? oldPassword : "");
    formData.append("newPassword", newPassword ? newPassword : "");

    return this.http.post(API_BASE_PATH + `/user/${userId}/changepassword`, formData);
  }

  // For admins only: to reset.
  resetUserPassword(userId: number, newPassword: string): Observable<any> {
    let formData = new FormData();
    formData.append("newPassword", newPassword ? newPassword : "");

    return this.http.post(API_BASE_PATH + `/user/${userId}/resetpassword`, formData);
  }

  uploadUserPic(userId: number, file: File): Observable<UploadProgress> {
    let formData = new FormData();
    formData.append("file", file);

    return new Observable<UploadProgress>((observer) => {
      this.http.post(API_BASE_PATH + `/user/${userId}/uploadprofilepic`, formData, {reportProgress: true, observe: 'events'})
        .subscribe(event => {
          let currentState: UploadProgress = null;
          if (event.type == HttpEventType.UploadProgress) {
            currentState = {
              isCompleted: false,
              total: event.total,
              done: event.loaded
            };

            observer.next(currentState);
          } else if (event.type == HttpEventType.Response) {
            currentState = {
              isCompleted: true,
              total: 1,
              done: 1
            }

            observer.next(currentState);
            observer.complete();
          }
        }, error => {
          observer.error(error);
        });

      return {
        unsubscribe() {
          // Not supported
        }
      }
    });
  }

  resetUserPic(userId: number): Observable<any> {
    return this.http.post(API_BASE_PATH + `/user/${userId}/resetprofilepic`, {});
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(API_BASE_PATH + `/user/${userId}`);
  }

  //------------- Utilities

  isCorrectUserName(userName: string): boolean {
    if (userName) {
      return !isAllSpaces(userName);
    }

    return false;
  }

  isAcceptablePassword(password: string): boolean {
    if (password) {
      if (isAllSpaces(password)) {
        return false;
      }

      return password.length >= 6;
    }

    return false;
  }

  getErrorCodeText(errorCode: string): string {
    switch (errorCode) {
      case "BAD_NAME":
        return "Имя пользователя не должно быть пустым, и не должно состоять из одних лишь пробелов.";
      case "WEAK_PASSWORD":
        return "Пароль не удовлетворяет. Нужно хотя бы 6 символов, и нельзя одни лишь пробелы.";
      case "ALREADY_EXISTS":
        return "Пользователь с таким именем уже существует.";
      case "RENAME_FORBIDDEN":
        return "Переименование запрещено ЛИЧНО ГИТЛЕРЫМ.";
      case "WRONG_PASSWORD":
        return "Неверно задан текущий пароль.";
      case "FILE_TOO_LARGE":
        return "Слишком большой файл. Максимальный размер - 16 МБ.";
      case "FILE_NOT_SUPPORTED":
        return "Формат файла не поддерживается.";
      case "FILE_EMPTY":
        return "Файл пустой.";
      case "DELETE_SELF":
        return "Удалять самого себя нельзя.";
      case "RESETADMIN_SELF":
        return "Самоотвод не принимается."
    }

    return "Неизвестная ошибка от сервера";
  }

  getFullErrorText(error: any): string {
    if (error.error) {
      if (typeof error.error == "string") {
        return this.getErrorCodeText(error.error);
      } else if (error.error.errors && error.error.errors.id && Array.isArray(error.error.errors.id)) {
        return error.error.errors.id.join("\r\n");
      }
    }

    if (error.status == 404) {
      return "Пользователь не найден";
    } else if (error.status == 401) {
      return "Вы не авторизованы";
    } else if (error.status == 403) {
      return "Нет прав для осуществления операции.";
    } else if (error.status == 423) {
      return "Данное действие нельзя произвести по техническим причинам.\r\nНа время проведения важных работ сайт переведен админом в режим только чтение.";
    } else if (error.status == 0) {
      return "Сервер не отвечает";
    }

    return "Неизвестная ошибка сервера";
  }
}
