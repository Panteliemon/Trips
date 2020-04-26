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
    users: User[];
    
    isLoginFormShown: boolean;

    constructor (private usersService: UsersService, private authService: AuthService) {
    }

    get userName(): string {
      return this.authService.user?.name;
    }

    get userId(): number {
      return this.authService.user?.id;
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
