import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { isAllSpaces } from 'src/app/stringUtils';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  isLoaderVisible: boolean;

  returnUrl: string;

  userName: string;
  password: string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private authService: AuthService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.returnUrl = this.activatedRoute.snapshot.queryParams["returnUrl"];
  }

  onEnterButtonClicked() {
    if ((!this.userName) || isAllSpaces(this.userName)) {
      this.messageService.showMessage("Введите имя пользователя");
      return;
    }

    // enough talk
    this.isLoaderVisible = true;
    this.authService.authenticate(this.userName, this.password).subscribe(() => {
      this.isLoaderVisible = false;
      this.password = "";
      this.router.navigate([this.returnUrl || "/news"]);
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

  onTextFieldsKeyUp(event) {
    if (event.keyCode == 13) {
      this.onEnterButtonClicked();
    }
  }
}
