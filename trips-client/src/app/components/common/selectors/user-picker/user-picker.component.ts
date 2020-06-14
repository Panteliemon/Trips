import { Component, OnInit } from '@angular/core';
import { UserHeader } from 'src/app/models/user-header';
import { UsersService, userPicSrc } from 'src/app/services/users.service';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { PopupsService } from 'src/app/services/popups.service';

@Component({
  selector: 'app-user-picker',
  templateUrl: './user-picker.component.html',
  styleUrls: ['./user-picker.component.css']
})
export class UserPickerComponent implements OnInit {
  // How to use:
  // Access through PopupsService.
  // Call show() when needed.

  isVisible: boolean;
  caption: string;
  isLoaderVisible: boolean;

  users: UserHeader[];

  onSelected: (value: UserHeader) => void;
  excludeUsers: UserHeader[];

  constructor(private usersService: UsersService, private messageService: MessageService, private popupsService: PopupsService) { }

  ngOnInit(): void {
    this.popupsService.registerUserPicker(this);
  }

  show(caption: string, onSelected: (value: UserHeader) => void, excludeUsers: UserHeader[] = null) {
    this.caption = caption;
    this.onSelected = onSelected;
    this.excludeUsers = excludeUsers;
    this.isVisible = true;

    // No search, no pagination
    this.startReloadUsers();
  }

  userRowClicked(user: UserHeader) {
    this.isVisible = false;
    if (this.onSelected) {
      this.onSelected(user);
    }
  }

  cancelClicked() {
    this.isVisible = false;
  }

  userPicSrc = userPicSrc;

  private startReloadUsers() {
    this.isLoaderVisible = true;
    this.users = [];
    this.usersService.getAllUsers().subscribe(users => {
      this.users = users.filter(u => !this.isUserExcluded(u));
      this.isLoaderVisible = false;
    }, error => {
      this.isLoaderVisible = false;
      this.messageService.showMessage(this.usersService.getFullErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }

  private isUserExcluded(user: UserHeader): boolean {
    if (this.excludeUsers) {
      if (this.excludeUsers.find(u => u.id == user.id)) {
        return true;
      }
    }

    return false;
  }
}
