import { Component, OnInit } from '@angular/core';
import { User } from "../../../models/user";
import { UsersService, userPicSrc } from "../../../services/users.service";
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserHeader } from 'src/app/models/user-header';

@Component({
  selector: 'app-users-main',
  templateUrl: './users-main.component.html',
  styleUrls: ['./users-main.component.css']
})
export class UsersMainComponent implements OnInit {
  users: UserHeader[];

  isLoaderVisible: boolean;

  canAddUsers: boolean;

  constructor(private usersService: UsersService, private messageService: MessageService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoaderVisible = true;
    this.usersService.getAllUsers().subscribe(users => {
        this.users = users;
        this.tuneVisibility();
      },
      error => {
        this.messageService.showMessage(this.usersService.getFullErrorText(error), MessageButtons.ok, MessageIcon.error);
        this.tuneVisibility();
      }
    );
  }

  userPicSrc = userPicSrc;

  private tuneVisibility() {
    this.isLoaderVisible = false;
    this.canAddUsers = this.authService.user?.isAdmin == true;
  }
}
