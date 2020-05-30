import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MessageService, MessageButtons, MessageIcon, MessageResult } from 'src/app/services/message.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ServiceService } from 'src/app/services/service.service';
import { ServiceOperation } from 'src/app/models/service-operation';
import { Observable } from 'rxjs';
import { ServiceOperationStatus } from 'src/app/models/service-operation-status';
import { StartResultCode } from 'src/app/models/service-operation-start-result';

const MONITOR_INTERVAL: number = 2000;

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.less']
})
export class ServiceComponent implements OnInit, OnDestroy {
  private isDestroyed: boolean;
  private monitorErrorCounter: number = 0;
  private resetLoaderOnMonitorArrive: boolean;

  @ViewChild("operationLog")
  logElement: ElementRef;

  serviceOperations: ServiceOperation[];
  selectedOperation: ServiceOperation;

  // Operation that is currently being performed or that was performed last
  currentOperationStatus: ServiceOperationStatus;
  // Id of the last operation started by this component.
  ourOperationId: number = null;
  currentOperationCaption: string;
  currentOperationLog: string = "";

  areSettingsVisible: boolean;
  isLogVisible: boolean;
  isCurrentTabLog: boolean;

  isOverallLoaderVisible: boolean;

  constructor(private messageService: MessageService, private authService: AuthService, private router: Router,
              private srv: ServiceService) { }
  
  ngOnInit(): void {
    if ((!this.authService.user) || (!this.authService.user.isAdmin)) {
      this.router.navigate(["/"]);
      this.messageService.showMessage("Доступ запрещён", MessageButtons.ok, MessageIcon.prokhanization);
    } else {
      this.isOverallLoaderVisible = true;
      this.srv.getOperationsList().subscribe(list => {
        this.serviceOperations = list;       
        // Start monitor
        this.monitor();

        this.resetLoaderOnMonitorArrive = true;
      }, error => {
        this.isOverallLoaderVisible = false;
        this.showServerErrorMessage(error);
      });
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
  }

  selectOperation(operation: ServiceOperation) {
    this.selectedOperation = operation;
  }

  launchClicked() {
    this.messageService.showMessage(`Запускаем операцию ${this.selectedOperation.name} ?`, MessageButtons.yesNo, MessageIcon.warning).subscribe(result => {
      if (result == MessageResult.yes) {
        this.isOverallLoaderVisible = true;
        this.srv.startOperation(this.selectedOperation.key).subscribe(result => {
          switch (result.resultCode) {
            case StartResultCode.OK: {
              this.ourOperationId = result.operationId;
              this.currentOperationLog = "";
              // Go back to operation selection (after current operation is ready)
              this.selectedOperation = null;
            } break;

            case StartResultCode.INVALID_ARGUMENT: {
              this.messageService.showMessage("Оргумент!", MessageButtons.ok, MessageIcon.error); // I know it tells nothing, but it never happens anyway
            } break;

            case StartResultCode.ANOTHER_RUNS_NOW: {
              this.messageService.showMessage("В данный момент уже запущена другая сервисная операция. Только одна сервисная операция может выполняться на сервере одновременно. Подождите или отмените текущую операцию.", MessageButtons.ok, MessageIcon.error);
            } break;

            case StartResultCode.REPEAT_FORBIDDEN: {
              this.messageService.showMessage("Данная операция предназначена для выполнения только один раз, и она уже была выполнена. Запуск запрещён.", MessageButtons.ok, MessageIcon.error);
            } break;
          }

          // Now stay disabled until monitor delivers actual status
          this.resetLoaderOnMonitorArrive = true;
        }, error => {
          this.isOverallLoaderVisible = false;
          this.showServerErrorMessage(error);
        });
      }
    });
  }

  async cancelCurrentOperationClicked() {
    let result = await this.messageService.showMessage("Прервать выполнение операции?", MessageButtons.yesNo, MessageIcon.warning).toPromise();

    if (result == MessageResult.yes) {
      if (this.currentOperationStatus.operationId != this.ourOperationId) {
        let result2 = await this.messageService.showMessage("Данная операция не была запущена на текущей вкладке. Может даже быть, что она была запущена не вами. Так, и что. Прервать выполнение операции?", MessageButtons.yesNo, MessageIcon.warning).toPromise();
        if (result2 != MessageResult.yes) {
          return;
        }
      }

      this.isOverallLoaderVisible = true;
      try {
        await this.srv.cancelCurrentOperation().toPromise();

        // Do nothing.
        // Hold loader until monitor receives actual status
        this.resetLoaderOnMonitorArrive = true;
      } catch (error) {
        this.isOverallLoaderVisible = false;
        this.showServerErrorMessage(error);
      }
    }
  }

  private monitor() {
    if (!this.isDestroyed) {
      this.srv.getCurrentStatus().subscribe(status => {
        // Perform on-monitor-arrive actions
        if (this.resetLoaderOnMonitorArrive) {
          this.isOverallLoaderVisible = false;
          this.resetLoaderOnMonitorArrive = false;
        }

        // Check if was in finished state until new data arrived
        let wasFinished = false;
        if (this.currentOperationStatus) {
          wasFinished = !!this.currentOperationStatus.finishTime;
        }

        this.currentOperationStatus = status;
        this.refreshSettingsVisible();

        if (this.currentOperationStatus) {
          this.isCurrentTabLog = this.currentOperationStatus.operationId == this.ourOperationId;

          if (this.currentOperationStatus.finishTime) {
            this.currentOperationCaption = "Последняя операция, выполненная на сервере";
            // If finished right now, then update the list, so we can see actual start/finish time in it
            if (!wasFinished) {
              this.onOperationFinished();

              if (this.isCurrentTabLog) {
                // One last time
                this.queryLog();
              }
            }

            this.isLogVisible = this.isCurrentTabLog;
          } else {
            this.currentOperationCaption = "Операция, выполняемая на сервере";
            this.isLogVisible = true;
            if (this.isCurrentTabLog) {
              this.queryLog();
            }
          }

          if (!this.isCurrentTabLog) {
            this.currentOperationLog = "";
          }
        }

        setTimeout(() => this.monitor(), MONITOR_INTERVAL);
      }, error => {
        this.showServerErrorMessage(error).subscribe(() => {
          // Stop monitor if too many errors
          this.monitorErrorCounter++;
          if (this.monitorErrorCounter < 5) {
            // Not too many
            setTimeout(() => this.monitor(), MONITOR_INTERVAL);
          }
        });
      })
    }
  }

  private showServerErrorMessage(serverError: any): Observable<MessageResult> {
    return this.messageService.showMessage(this.srv.getServerErrorText(serverError), MessageButtons.ok, MessageIcon.error);
  }

  private refreshSettingsVisible() {
    if (this.currentOperationStatus) {
      // Allow if is finished
      this.areSettingsVisible = !!this.currentOperationStatus.finishTime;
    } else {
      this.areSettingsVisible = true;
    }
  }

  private onOperationFinished() {
    this.isOverallLoaderVisible = true;
    this.srv.getOperationsList().subscribe(list => {
      this.serviceOperations = list;       
      this.isOverallLoaderVisible = false;
    }, error => {
      this.isOverallLoaderVisible = false;
      this.showServerErrorMessage(error);
    });
  }

  private queryLog() {
    this.srv.takeLatestOutput().subscribe(result => {
      if (result !== null) {
        if (this.currentOperationLog && (this.currentOperationLog.length > 0)) {
          this.currentOperationLog += "\r\n" + result;
        } else {
          this.currentOperationLog = result;
        }

        if (this.logElement) {
          // Automatically scroll to end only if is already scrolled to end
          let scrollToEnd = this.logElement.nativeElement.scrollTop >= (this.logElement.nativeElement.scrollHeight - this.logElement.nativeElement.clientHeight);

          this.logElement.nativeElement.innerText = this.currentOperationLog;
          if (scrollToEnd) {
            this.logElement.nativeElement.scrollTop = this.logElement.nativeElement.scrollHeight - this.logElement.nativeElement.clientHeight;
          }
        }
      }
    }); // don't show error if there is error
  }
}
