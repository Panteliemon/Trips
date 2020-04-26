import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { isAllSpaces } from 'src/app/stringUtils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  @Input()
  isShown: boolean;
  @Output()
  isShownChange = new EventEmitter<boolean>();

  userName: string;
  password: string;

  isLoaderVisible: boolean;

  constructor(private router: Router, private authService: AuthService, private messageService: MessageService) { }

  ngOnInit(): void {
  }

  onEnterButtonClicked() {
    if ((!this.userName) || isAllSpaces(this.userName)) {
      this.messageService.showMessage("Введите имя пользователя");
      return;
    }

    this.isLoaderVisible = true;
    this.authService.authenticate(this.userName, this.password).subscribe(() => {
      this.isLoaderVisible = false;
      this.closeButtonClicked();
      this.router.navigate(["/news"]);
    }, error => {
      this.isLoaderVisible = false;

      if (error.status == 404) {
        this.messageService.showMessage(`Пользователь ${this.userName} не найден`, MessageButtons.ok, MessageIcon.error);
      } else if (error.status == 400) {
        this.messageService.showMessage("Неверный пароль", MessageButtons.ok, MessageIcon.error);
        this.password = "";
      } else {
        this.messageService.showMessage("communication error", MessageButtons.ok, MessageIcon.error);
      }
    });
  }

  closeButtonClicked() {
    this.password = "";
    this.isShown = false;
    this.isShownChange.emit(false);
  }

  onTextFieldsKeyUp(event) {
    if (event.keyCode == 13) {
      this.onEnterButtonClicked();
    }
  }
}
