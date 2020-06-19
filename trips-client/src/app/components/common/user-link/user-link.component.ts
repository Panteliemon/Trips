import { Component, OnInit, Input } from '@angular/core';
import { UserHeader } from 'src/app/models/user-header';
import { userPicSrc } from 'src/app/services/users.service';

@Component({
  selector: 'app-user-link',
  templateUrl: './user-link.component.html',
  styleUrls: ['./user-link.component.less']
})
export class UserLinkComponent implements OnInit {
  @Input()
  user: UserHeader;

  @Input()
  showProfilePicture: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  userPicSrc = userPicSrc;
}
