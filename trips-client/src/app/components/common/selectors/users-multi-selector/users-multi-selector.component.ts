import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { UserHeader } from 'src/app/models/user-header';
import { userPicSrc } from 'src/app/services/users.service';
import { PopupsService } from 'src/app/services/popups.service';

@Component({
  selector: 'app-users-multi-selector',
  templateUrl: './users-multi-selector.component.html',
  styleUrls: ['./users-multi-selector.component.less']
})
export class UsersMultiSelectorComponent implements OnInit, OnChanges {
  @Input()
  selectedUsers: UserHeader[] = [];
  @Input()
  isEditable: boolean = true;

  @Output()
  added = new EventEmitter<UserHeader>();
  @Output()
  removed = new EventEmitter<UserHeader>();

  constructor(private popupsService: PopupsService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  userPicSrc = userPicSrc;

  addButtonClicked() {
    this.popupsService.userPicker.show("Выберите участника", selectedUser => {
      this.selectedUsers.push(selectedUser);
      this.added.emit(selectedUser);
    }, this.selectedUsers);
  }

  deleteButtonClicked(user: UserHeader) {
    let index = this.selectedUsers?.findIndex(u => u.id == user.id);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
      this.removed.emit(user);
    }
  }
}
