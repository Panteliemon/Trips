import { Component, OnInit } from '@angular/core';
import { MessageService, MessageResult, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {
  private _userName: string;
  private _userNameSetCounter: number = 0;
  password: string;
  password2: string;

  isUserNameValid: boolean;
  isPasswordValid: boolean;

  isUserExistsVisible: boolean;

  isLoaderVisible: boolean;

  constructor(private messageService: MessageService, private usersService: UsersService, private router: Router) { }

  get userName(): string {
    return this._userName;
  }

  set userName(value) {
    this._userName = value;
    this._userNameSetCounter++;

    let counterWhenTimeoutWasSet = this._userNameSetCounter;
    setTimeout(() => {
      if (this._userNameSetCounter == counterWhenTimeoutWasSet) {
        if (this._userName) {
          this.usersService.getUserByName(this._userName.trim()).subscribe(user => {
            this.isUserExistsVisible = !!user;
          }, error => {
            this.isUserExistsVisible = false;
          });
        } else {
          this.isUserExistsVisible = false;
        }
      }
    }, 500);
  }

  ngOnInit(): void {
  }

  addButtonClicked() {
    // Verify
    if (!this.userName) {
      this.messageService.showMessage("Потребность в имени пользователя составляет одну штуку");
      return;
    }

    this.userName = this.userName.trim();

    if (!this.usersService.isCorrectUserName(this.userName)) {
      this.messageService.showMessage("Имя пользователя не должно состоять из одних лишь пробелов");
      return;
    }

    if (!this.usersService.isAcceptablePassword(this.password)) {
      this.messageService.showMessage("Пароль не удовлетворяет: нужно хотя бы 6 символов, и нельзя одни лишь пробелы");
      return;
    }

    if (this.password != this.password2) {
      this.messageService.showMessage("Пароль не совпадает с подтверждением пароля");
      return;
    }

    // Some time-consuming verification
    this.isLoaderVisible = true;
    this.usersService.getUserByName(this.userName).subscribe(user => {
      if (user) {
        this.messageService.showMessage(`Пользователь с именем ${user.name} уже существует, задайте другое имя.`, MessageButtons.ok, MessageIcon.warning);
        this.isLoaderVisible = false;
      } else {
        // Final question
        this.isLoaderVisible = false;
        this.messageService.showMessage(`Добавить пользователя ${this.userName}?`, MessageButtons.yesNo, MessageIcon.question).subscribe(answer => {
          if (answer == MessageResult.yes) {
            // Do create
            this.isLoaderVisible = true;
            this.usersService.createNewUser(this.userName, this.password).subscribe(next => {
              // Created OK, I guess, let's request what we created so we retrieve the id
              this.usersService.getUserByName(this.userName).subscribe(user => {
                // Navigate to created user page
                this.router.navigate([`/user/${user.id}`]);
              }, error => {
                this.handleServerError(error);
                this.isLoaderVisible = false;
              })
            }, error => {
              this.handleServerError(error);
              this.isLoaderVisible = false;
            });
          }
        }); 
      }
    }, error => {
      this.handleServerError(error);
      this.isLoaderVisible = false;
    });
  }

  private handleServerError(error) {
    this.messageService.showMessage("Ошибка от сервера: " + this.usersService.getFullErrorText(error), MessageButtons.ok, MessageIcon.error);
  }
}
