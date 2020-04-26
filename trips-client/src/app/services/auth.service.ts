import { Injectable } from '@angular/core';
import { LoginFormComponent } from '../components/common/login-form/login-form.component';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { API_BASE_PATH } from './api';
import { AuthenticationResult } from '../models/authentication-result';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _loginForm: LoginFormComponent;
  private _current: AuthenticationResult;

  constructor(private http: HttpClient, private router: Router) {
    this._current = JSON.parse(localStorage.getItem("currentAuth"));
  }

  get user(): User {
    return this._current?.user;
  }

  get token(): string {
    return this._current?.token;
  }

  authenticate(userName: string, password: string): Observable<any> {
    return new Observable<any>(observer => {
      let formData = new FormData();
      formData.append("userName", userName ? userName : "");
      formData.append("password", password ? password : "");
      this.http.post<AuthenticationResult>(API_BASE_PATH + "/authenticate", formData).subscribe(result => {
        this._current = result;
        localStorage.setItem("currentAuth", JSON.stringify(this._current));

        observer.next();
        observer.complete();
      }, error => {
        observer.error(error);
      })

      return {
        unsubscribe() {
          // not supported
        }
      };
    });
  }

  logout() {
    localStorage.removeItem("currentAuth");
    this._current = null;
    this.router.navigate(["/news"]);
  }
}
