import { Component, OnInit } from '@angular/core';
import { MessageService, MessageIcon, MessageResult } from '../../../services/message.service';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.css']
})
export class MessageBoxComponent implements OnInit {
  MessageResultEnum = MessageResult;

  // All these public properties are tuned outside by MessageService
  isShown: boolean = false;

  header: string;
  message: string;

  isOkVisible: boolean;
  isYesVisible: boolean;
  isNoVisible: boolean;
  isCancelVisible: boolean;

  iconSrc: string;
  largeIconSrc: string;
  aboveHeaderPictureSrc: string;

  isYesButtonDanger: boolean;

  constructor(private messageService: MessageService) {
  }

  onButtonClicked: (button: MessageResult) => void;

  ngOnInit(): void {
    this.messageService.attach(this);
  }
}
