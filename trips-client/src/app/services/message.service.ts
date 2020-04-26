import { Injectable } from '@angular/core';
import { MessageBoxComponent } from '../components/common/message-box/message-box.component';
import { Observable, of, Observer } from 'rxjs';

export enum MessageButtons {
  ok, yesNo
}

export enum MessageIcon {
  none, error, warning, info, question, seriously, prokhanization
}

export enum MessageResult {
  ok, yes, no
}

class MsgData {
  message: string;
  buttons: MessageButtons;
  icon: MessageIcon;
  header: string;
  observers: Observer<MessageResult>[];
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageBoxComponent: MessageBoxComponent;
  private messageQueue: MsgData[] = [];
  private currentlyDisplayedMessage: MsgData;

  constructor() { }

  attach(messageBoxComponent: MessageBoxComponent) {
    this.messageBoxComponent = messageBoxComponent;
    this.messageBoxComponent.onButtonClicked = (button: MessageResult) => {
      this.messageBoxComponent.isShown = false;

      // Notify observers
      for (let observer of this.currentlyDisplayedMessage.observers) {
        observer.next(button);
        observer.complete();
      }

      this.currentlyDisplayedMessage = null;
      this.showFromQueueIfAny();
    }

    // If there were already messages added while service wasn't initialized, start to show them
    this.showFromQueueIfAny();
  }

  showMessage(message: string, buttons: MessageButtons = MessageButtons.ok, icon: MessageIcon = MessageIcon.none, header: string = null): Observable<MessageResult> {
    // Construct the data and put to the queue
    let msgData: MsgData = {
      message: message,
      buttons: buttons,
      icon: icon,
      header: header,
      observers: [],
    };
    
    this.messageQueue.push(msgData);

    // This is observable for our messagebox result
    let result = new Observable<MessageResult>((observer) => {
      msgData.observers.push(observer);

      return {
        unsubscribe() {
          let currentObserverIndex = msgData.observers.indexOf(observer);
          if (currentObserverIndex >= 0) {
            msgData.observers.splice(currentObserverIndex, 1);
          }
        }
      }
    });

    if (this.messageBoxComponent) {
      if (this.messageBoxComponent.isShown) {
        // Do nothing
      } else {
        // Great, show right now
        this.showFromQueueIfAny();
      }
    } else {
      // Do nothing! Wait until someone attaches.
    }

    return result;
  }

  private showFromQueueIfAny() {
    if (this.messageQueue.length > 0) {
      this.currentlyDisplayedMessage = this.messageQueue.shift();

      this.messageBoxComponent.header = this.currentlyDisplayedMessage.header;
      this.messageBoxComponent.message = this.currentlyDisplayedMessage.message;

      this.tuneButtons();
      this.tuneIcon();

      this.messageBoxComponent.isShown = true;
    }
  }

  private tuneButtons() {
    switch (this.currentlyDisplayedMessage.buttons) {
      case MessageButtons.ok:
        this.messageBoxComponent.isOkVisible = true;
        this.messageBoxComponent.isYesVisible = false;
        this.messageBoxComponent.isNoVisible = false;
        break;

      case MessageButtons.yesNo:
        this.messageBoxComponent.isOkVisible = false;
        this.messageBoxComponent.isYesVisible = true;
        this.messageBoxComponent.isNoVisible = true;
        break;
    }
  }

  private tuneIcon() {
    switch (this.currentlyDisplayedMessage.icon) {
      case MessageIcon.error:
        this.messageBoxComponent.iconSrc = "/assets/icon-error.png";
        break;
      case MessageIcon.warning:
        this.messageBoxComponent.iconSrc = "/assets/icon-warning.png";
        break;
      case MessageIcon.info:
        this.messageBoxComponent.iconSrc = "/assets/icon-information.png";
        break;
      case MessageIcon.question:
        this.messageBoxComponent.iconSrc = "/assets/icon-question.png";
        break;
      default:
        this.messageBoxComponent.iconSrc = null;
        break;
    }

    switch (this.currentlyDisplayedMessage.icon) {
      case MessageIcon.seriously:
        this.messageBoxComponent.aboveHeaderPictureSrc = "/assets/seriously.jpg";
        this.messageBoxComponent.isYesButtonDanger = true;
        break;
      default:
        this.messageBoxComponent.aboveHeaderPictureSrc = null;
        this.messageBoxComponent.isYesButtonDanger = false;
        break;
    }

    switch (this.currentlyDisplayedMessage.icon) {
      case MessageIcon.prokhanization:
        this.messageBoxComponent.largeIconSrc ="/assets/icon-prokhanization.png";
        break;
      default:
        this.messageBoxComponent.largeIconSrc = null;
        break;
    }
  }
}
