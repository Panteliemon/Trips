import { Component, OnInit, Output } from '@angular/core';
import { User } from "./models/user";
import { UsersService } from "./services/users.service";
import { onErrorResumeNext } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    isLoginFormShown: boolean;

    constructor (private usersService: UsersService, private authService: AuthService) {
    }

    get user(): User {
      return this.authService.user;
    }

    ngOnInit() {

    }

    onLoginButtonClicked() {
      this.isLoginFormShown = true;
    }

    onLogoutButtonClicked() {
      this.authService.logout();
    }
}
