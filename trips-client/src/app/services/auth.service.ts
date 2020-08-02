import { Injectable, Injector } from '@angular/core';
import { LoginFormComponent } from '../components/common/login-form/login-form.component';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { API_BASE_PATH } from './api';
import { AuthenticationResult } from '../models/authentication-result';
import { Router, Route, CanActivate } from '@angular/router';
import { MessageService, MessageButtons, MessageIcon } from './message.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _loginForm: LoginFormComponent;
  private _current: AuthenticationResult;

  constructor(private http: HttpClient, private router: Router, private injector: Injector, private messageService: MessageService) {
    this._current = JSON.parse(localStorage.getItem("currentAuth"));
    this.normalizeAuthResult(this._current);
  }

  get user(): User {
    this.handleExpiration();
    return this._current?.user;
  }

  get token(): string {
    this.handleExpiration();
    return this._current?.token;
  }

  authenticate(userName: string, password: string): Observable<any> {
    return new Observable<any>(observer => {
      let formData = new FormData();
      formData.append("userName", userName ? userName : "");
      formData.append("password", password ? password : "");
      this.http.post<AuthenticationResult>(API_BASE_PATH + "/authenticate", formData).subscribe(result => {
        this.normalizeAuthResult(result);
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

  private normalizeAuthResult(authResult: AuthenticationResult) {
    if (authResult?.expires && (typeof authResult.expires == "string")) {
      authResult.expires = new Date(authResult.expires);
    }
  }

  // Performs automatic log-out if authorization token has expired
  private handleExpiration() {
    if (this._current?.expires) {
      if (this._current.expires < new Date()) {
        console.warn("Authorization token has SUDDENLY expired! Auto log-out.");

        localStorage.removeItem("currentAuth");
        this._current = null;
        
        // Check if we can nevertheless stay on the current page
        if (this.canNavigateTo(this.router.url)) {
          // Make user know
          this.messageService.showMessage("Срок авторизации на сайте истёк. Необходимо перелогиниться.", MessageButtons.ok, MessageIcon.warning);
        } else {
          this.router.navigate(["/login"], { queryParams: { returnUrl: this.router.url } });
        }
      }
    }
  }

  private canNavigateTo(url: string): boolean {
    let route = this.resolveRoute(url);
    if (!route) {
      return true;
    }

    if (route.canActivate) {
      for (let guard of route.canActivate) {
        let guardInstance = this.injector.get(guard) as CanActivate;
        if (guardInstance) {
          if (!guardInstance.canActivate(null, null)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private resolveRoute(url: string): Route {
    // They didn't expose built-in URL matching mechanism (see function defaultUrlMatcher),
    // so make something primitive on our own
    
    if (url.startsWith("/")) { // which it certainly does
      url = url.substring(1);
    }

    let splitUrl = url.toLowerCase().split("/");
    if (splitUrl.length > 0) {
      for (let route of this.router.config) {
        let splitRoute = route.path?.toLowerCase().split("/"); // we are completely missing custom matchers here, yeah, I know
        // also nested routes and shit
        if (splitRoute && (splitRoute.length > 0)) {
          if (splitRoute[0] == splitUrl[0]) {
            return route;
          }
        }
      }
    } else {
      return this.router.config.find(r => (r.path == "") || (r.path == "**"));
    }

    return null;
  }
}
