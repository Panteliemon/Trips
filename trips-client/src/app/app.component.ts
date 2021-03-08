import { Component, OnInit, Output } from '@angular/core';
import { User } from "./models/user";
import { UsersService } from "./services/users.service";
import { onErrorResumeNext } from 'rxjs';
import { AuthService } from './services/auth.service';
import { MessageService, MessageButtons, MessageIcon, MessageResult } from './services/message.service';

const annotations = [
  'Выбирэйшон и крики "ЭЭЭА!!!"',
  "Тилль, Ждамиров и Костоступ.",
  "Волколатка и Габитация.",
  "Хетцеряние и вверение бохольти.",
  'Чипсы "Пукан" и Жидкий Иисус.',
  "Валёчек, Колёчек, Лёнька Куклин.",
  "Ой, этот Гешторов!"
]

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    isLoginFormShown: boolean;
    annotation: string;

    constructor (private usersService: UsersService, private authService: AuthService, private messageService: MessageService) {
      this.annotation = annotations[Math.floor(Math.random() * annotations.length)];
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
      this.messageService.showMessage("Выйти?", MessageButtons.yesNo, MessageIcon.question).subscribe(result => {
        if (result == MessageResult.yes) {
          this.authService.logout();
        }
      }); 
    }
}
