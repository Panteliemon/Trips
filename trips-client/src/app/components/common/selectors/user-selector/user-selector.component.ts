import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { UserHeader } from 'src/app/models/user-header';
import { PopupsService } from 'src/app/services/popups.service';
import { UsersService, userPicSrc } from 'src/app/services/users.service';

@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.css']
})
export class UserSelectorComponent implements OnInit, OnChanges {
  @Input()
  value: UserHeader;
  @Output()
  valueChange = new EventEmitter<UserHeader>();

  @Input()
  isEditable: boolean = true;

  selectButtonCaption: string;

  constructor(private popupsService: PopupsService) { }

  ngOnInit(): void {
    this.refreshSelectButtonCaption();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["value"]) {
      this.refreshSelectButtonCaption();
    }
  }

  userPicSrc = userPicSrc;

  selectClicked() {
    if (this.isEditable) {
      let excludeUsers: UserHeader[] = [];
      if (this.value) {
        excludeUsers.push(this.value);
      }

      this.popupsService.userPicker.show("Выберите владельца", user => {
        this.value = user;
        this.refreshSelectButtonCaption();
        this.valueChange.emit(this.value);
      }, excludeUsers);
    }
  }

  clearClicked() {
    if (this.isEditable && this.value) {
      this.value = null;
      this.refreshSelectButtonCaption();
      this.valueChange.emit(this.value);
    }
  }

  private refreshSelectButtonCaption() {
    this.selectButtonCaption = this.value ? "Изменить..." : "Выбрать...";
  }
}
