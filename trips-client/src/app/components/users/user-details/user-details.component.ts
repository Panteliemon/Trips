import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { UsersService, userPicSrc } from 'src/app/services/users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, MessageButtons, MessageResult, MessageIcon } from 'src/app/services/message.service';
import { AuthService } from 'src/app/services/auth.service';
import { TripHeader } from 'src/app/models/trip-header';
import { TripsService } from 'src/app/services/trips.service';
import { VehicleHeader } from 'src/app/models/vehicle-header';
import { VehiclesService } from 'src/app/services/vehicles.service';

const TRIPS_LOAD_PORTION: number = 20;

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  user: User;
  notFound: boolean = false;

  imgSrc: string;
  imgAlt: string;

  isChangeProfilePicButtonVisible: boolean;
  isResetProfilePicButtonVisible: boolean;
  changeProfilePicButtonCaption: string;

  isPictureLoaderVisible: boolean;
  isOverallLoaderVisible: boolean;

  canChangeLogin: boolean;
  canChangePassword: boolean;
  canResetPassword: boolean;
  canSeeIsAdmin: boolean;
  canSeeIsGuest: boolean;
  canSeePrivileges: boolean;
  canSetIsAdmin: boolean;
  canSetIsGuest: boolean;
  canEditPrivileges: boolean;
  canDeleteUser: boolean;

  isChangeLoginExpanded: boolean;
  private _newLogin: string;
  isLoginAlreadyExistsVisible: boolean;

  isChangePasswordExpanded: boolean;
  currentPassword: string;
  newPassword: string;
  newPassword2: string;

  isResetPasswordExpanded: boolean;
  passwordForReset: string;

  isVehiclesOfUserVisible: boolean;
  vehiclesOfUser: VehicleHeader[];
  isVehiclesLoaderVisible: boolean;
  isAddNewVehicleVisible: boolean;

  isTripsOfUserVisible: boolean;
  tripsOfUser: TripHeader[];
  isTripsLoaderVisible: boolean;
  isLoadMoreTripsVisible: boolean;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private authService: AuthService,
    private messageService: MessageService,
    private tripsService: TripsService,
    private vehiclesService: VehiclesService) { }

  get newLogin(): string {
    return this._newLogin;
  }

  set newLogin(value: string) {
    this._newLogin = value;
    this.onNewLoginChanged();
  }

  ngOnInit(): void {
    let id = +this.route.snapshot.paramMap.get('id');
    this.isOverallLoaderVisible = true;
    this.usersService.getUserById(id).subscribe(user => {
      this.user = user;
      this.refreshAllVisibility();

      // Decide whether we display "vehicles of this user" and "trips of this user" sections
      if (this.user) {
        // Admin or self-not-guest: allow edit vehicles, so the section is always visible. Else: read only, display only if not empty.
        if (this.authService.user?.isAdmin || ((this.authService.user?.isGuest == false) && (this.authService.user?.id == this.user.id))) {
          this.isVehiclesOfUserVisible = true;
          this.isAddNewVehicleVisible = true;
        } else {
          this.isAddNewVehicleVisible = false;
          this.vehiclesService.getVehiclesList([this.user.id]).subscribe(vehicles => {
            this.isVehiclesOfUserVisible = vehicles && (vehicles.length > 0);
          }); // on error ignore
        }

        this.tripsService.getTripsList(1, 0, null, null, null, [this.user.id]).subscribe(trips => {
          this.isTripsOfUserVisible = trips && (trips.length > 0);
        }); // on error ignore
      }
    }, error => {
      this.messageService.showMessage(this.usersService.getFullErrorText(error), MessageButtons.ok, MessageIcon.error);
      this.user = null;
      this.refreshAllVisibility();
    });
  }

  onPictureFileSelected(files) {
    if (files.length > 0) {
      if (files.length > 1) {
        this.messageService.showMessage("Только один файл!", MessageButtons.ok, MessageIcon.warning);
      } else {
        let f: File = files[0];
        if (f.size > 16 * 1024 * 1024) {
          this.messageService.showMessage("Слишком большой файл. Максимальный размер: 16 МБ", MessageButtons.ok, MessageIcon.warning);
        } else {
          if (!this.isSupportedFileType(f.type)) {
            this.messageService.showMessage("Файл не поддерживается. Нужны картинки формата JPEG, PNG или BMP.", MessageButtons.ok, MessageIcon.warning);
          } else {
            // Go
            this.isResetProfilePicButtonVisible = false;
            this.isChangeProfilePicButtonVisible = false;
            this.isPictureLoaderVisible = true;
            this.usersService.uploadUserPic(this.user.id, files[0]).subscribe((state) => {
              if (state.isCompleted) {
                // Request ref to the picture
                this.usersService.getUserById(this.user.id).subscribe((user) => {
                  this.user.profilePicture = user.profilePicture;
                  this.refreshAllVisibility();

                  // Refresh in current user
                  if (this.authService.user.id == this.user.id) {
                    this.authService.user.profilePicture = user.profilePicture;
                    this.authService.user.smallSizeProfilePicture = user.smallSizeProfilePicture;
                  }
                });
              } else {
                // TODO show upload progress // TODO no.
              }
            }, error => {
              this.handleServerError(error);
              this.refreshAllVisibility();
            });
          }
        }
      }
    }
  }

  resetProfilePic() {
    if (this.user.profilePicture) {
      this.messageService.showMessage("Удаляем аватар?", MessageButtons.yesNo, MessageIcon.question).subscribe(button => {
        if (button == MessageResult.yes) {
          this.isResetProfilePicButtonVisible = false;
          this.isChangeProfilePicButtonVisible = false;
          this.isPictureLoaderVisible = true;
          this.usersService.resetUserPic(this.user.id).subscribe(next => {
            this.user.profilePicture = null;
            this.refreshAllVisibility();
          }, error => {
            this.user.profilePicture = null;
            this.refreshAllVisibility();
            this.handleServerError(error);
          });
        }
      });
    }
  }

  onDeleteUserClicked() {
    if (this.user) {
      this.messageService.showMessage("Удаление без возможности восстановления. Всё, что участник запостил, останется без автора висеть.\r\nУдалить?",
                                      MessageButtons.yesNo, MessageIcon.seriously, "То, что ты говоришь - это очень серьёзно.").subscribe(answer => {
        if (answer == MessageResult.yes) {
          let id = this.user.id;
          
          this.user = null;
          this.refreshAllVisibility();
          // Special state - not supported by general refresh procedure
          this.notFound = false;
          this.isOverallLoaderVisible = true;

          this.usersService.deleteUser(id).subscribe(() => {
            this.messageService.showMessage("УДОЛИЛ!!1", MessageButtons.ok, MessageIcon.info);
            this.router.navigate(['/users']);
          }, error => {
            this.handleServerError(error);
            // Don't have an idea whether delete succeeded or not, redirect to users list for safety
            this.router.navigate(['/users']);
          });
        }
      });
    }
  }

  onIsAdminCheckboxChanged() {
    if (this.user) {
      let oldIsAdmin = !this.user.isAdmin; // ¯\_(ツ)_/¯
      let message = oldIsAdmin ? "Вы должны понимать, что снятие одминства - это не хер собачий. Точно разжаловать до простого пользователя?"
                               : `При наделении пользователя админскими правами нужна гарантия того, что он не будет вахтёрить и коржовничать. Вручаем пользователю ${this.user.name} одминские права?`;
      this.messageService.showMessage(message, MessageButtons.yesNo, MessageIcon.seriously, "То, что ты говоришь - это очень серьёзно.").subscribe(result => {
        if (result == MessageResult.no) {
          this.user.isAdmin = oldIsAdmin;
        } else {
          this.isOverallLoaderVisible = true;
          this.usersService.updateUser(this.user).subscribe(() => {
            if (oldIsAdmin) {
              this.messageService.showMessage("Зря вы это делаете", MessageButtons.ok, MessageIcon.prokhanization);
            }
            this.refreshAllVisibility();
          }, error => {
            this.handleServerError(error);
            this.refreshAllVisibility();
          });
        }
      });
    }
  }

  async onIsGuestCheckboxChanged() {
    if (this.user) {
      // Restricted by UI: should not happen.
      if (this.user.isAdmin && this.user.isGuest) {
        if (this.authService.user?.id == this.user.id) {
          await this.messageService.showMessage("Птичку ставим, но поскольку вы админ, для вас ничего не изменится.", MessageButtons.ok, MessageIcon.info).toPromise();
        } else {
          await this.messageService.showMessage(`Ограничение "Гость" для пользователя ${this.user.name} не будет работать, поскольку этот пользователь является Администраторым.`, MessageButtons.ok, MessageIcon.warning).toPromise();
        }
      }

      // Don't indicate
      this.usersService.updateUser(this.user).subscribe(() => {
        this.refreshCanSetIsGuest();
        // no indication
      }, error => {
        this.handleServerError(error);
      });
    }
  }

  onPrivilegeCheckboxChanged() {
    if (this.user) {
      // Don't indicate
      this.usersService.updateUser(this.user).subscribe(() => {
        // no indication
      }, error => {
        this.handleServerError(error);
      });
    }
  }

  onExpandChangeLoginClicked() {
    this.isChangeLoginExpanded = true;
    this.newLogin = this.user.name;
    this.isLoginAlreadyExistsVisible = false;
  }

  onDoChangeLoginClicked() {
    if (this.newLogin == this.user.name) {
      this.onCancelChangeLoginClicked();
      this.messageService.showMessage("Имя пользователя остаётся прежним.");
      return;
    }

    if (!this.newLogin) {
      this.messageService.showMessage("Введите новый логин");
      return;
    }

    if (!this.usersService.isCorrectUserName(this.newLogin)) {
      this.messageService.showMessage("Имя пользователя не может быть пустым или состоять из одних лишь пробелов");
      return;
    }

    this.isOverallLoaderVisible = true;
    this.usersService.getUserByName(this.newLogin).subscribe(user => {
      if ((!user) || (user.id == this.user.id)) { // second condition should not happen
        let oldName = this.user.name;
        this.user.name = this.newLogin;
        this.usersService.updateUser(this.user).subscribe(() => {
          // All ok, reread user
          this.usersService.getUserById(this.user.id).subscribe(user => {
            this.user = user;
            this.authService.user.name = user.name; // just refresh name, that's it
            this.isOverallLoaderVisible = false;
            this.isChangeLoginExpanded = false;
            this.refreshAllVisibility();
          }, error => {
            this.isOverallLoaderVisible = false;
            this.isChangeLoginExpanded = false;
            this.messageService.showMessage(`Имя изменено успешно, но почему-то не получилось перечитать все параметры (${this.usersService.getFullErrorText(error)}). Попробуйте F5 что ли.`);
          });
        }, error => {
          this.user.name = oldName;
          this.isOverallLoaderVisible = false;
          this.handleServerError(error);
        });
      } else {
        this.isOverallLoaderVisible = false;
        this.messageService.showMessage(`Пользователь с именем ${user.name} уже существует. Введите другое имя.`);
      }
    }, error => {
      this.handleServerError(error);
      this.isOverallLoaderVisible = false;
    });
  }

  onCancelChangeLoginClicked() {
    this.isChangeLoginExpanded = false;
  }

  onExpandChangePasswordClicked() {
    this.isChangePasswordExpanded = true;
    this.currentPassword = "";
    this.newPassword = "";
    this.newPassword2 = "";
  }

  onDoChangePasswordClicked() {
    // Verify
    if (this.newPassword != this.newPassword2) {
      this.messageService.showMessage("Новый пароль и подтверждение нового пароля должны совпадать.");
      return;
    }

    if (!this.usersService.isAcceptablePassword(this.newPassword)) {
      this.messageService.showMessage("Новый пароль не удовлетворяет. Нужно хотя бы 6 символов, и нельзя одни пробелы.");
      return;
    }

    this.isOverallLoaderVisible = true;
    this.usersService.changeUserPassword(this.user.id, this.currentPassword, this.newPassword).subscribe(() => {
      this.isOverallLoaderVisible = false;
      this.onCancelChangePasswordClicked();
      this.messageService.showMessage("Пароль изменён успешно!", MessageButtons.ok, MessageIcon.info);
    }, error => {
      this.isOverallLoaderVisible = false;
      this.handleServerError(error);
    });
  }

  onCancelChangePasswordClicked() {
    this.isChangePasswordExpanded = false;
    this.currentPassword = "";
    this.newPassword = "";
    this.newPassword2 = "";
  }

  onExpandResetPasswordClicked() {
    this.isResetPasswordExpanded = true;
    this.passwordForReset = "";
  }

  onDoResetPasswordClicked() {
    if (!this.usersService.isAcceptablePassword(this.passwordForReset)) {
      this.messageService.showMessage("Новый пароль не удовлетворяет. Нужно хотя бы 6 символов, и нельзя одни пробелы.");
      return;
    }

    this.isOverallLoaderVisible = true;
    this.usersService.resetUserPassword(this.user.id, this.passwordForReset).subscribe(() => {
      this.isOverallLoaderVisible = false;
      this.onCancelResetPasswordClicked();
      this.messageService.showMessage("Пароль изменён успешно.", MessageButtons.ok, MessageIcon.info);
    }, error => {
      this.isOverallLoaderVisible = false;
      this.handleServerError(error);
    });
  }

  onCancelResetPasswordClicked() {
    this.isResetPasswordExpanded = false;
    this.passwordForReset = "";
  }

  onVehiclesOfUserExpandedChanged(isExpanded: boolean) {
    if (isExpanded && ((!this.vehiclesOfUser) || (this.vehiclesOfUser.length == 0))) {
      this.vehiclesOfUser = [];
      this.loadVehicles();
    }
  }

  getVehicleImgSrc(vehicle: VehicleHeader): string {
    return this.vehiclesService.getMiniatureImgSrc(vehicle);
  }

  getVehicleName(vehicle: VehicleHeader): string {
    return this.vehiclesService.getDisplayableVehicleName(vehicle);
  }

  onAddNewVehicleClicked() {
    let question = (this.authService.user?.id == this.user.id)
                   ? "Добавить вам транспортное средство?"
                   : `Добавить транспортное средство участнику ${this.user.name}?`;
    this.messageService.showMessage(question, MessageButtons.yesNo, MessageIcon.question).subscribe(answer => {
      if (answer == MessageResult.yes) {
        this.isOverallLoaderVisible = true;
        this.vehiclesService.createVehicle(this.user.id).subscribe(vehicle => {
          this.isOverallLoaderVisible = false;
          this.router.navigate([`/vehicle/${vehicle.id}`, { edit: true }]);
        }, error => {
          this.isOverallLoaderVisible = false;
          this.messageService.showMessage(this.vehiclesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
        });
      }
    });
  }

  onTripsOfUserExpandedChanged(isExpanded: boolean) {
    if (isExpanded && ((!this.tripsOfUser) || (this.tripsOfUser.length == 0))) {
      this.tripsOfUser = [];
      this.onLoadMoreTripsClicked();
    }
  }

  getTripImgSrc(trip: TripHeader): string {
    return this.tripsService.getMiniatureImgSrc(trip);
  }

  getTripTitle(trip: TripHeader): string {
    return this.tripsService.getDisplayableTripTitle(trip);
  }

  onLoadMoreTripsClicked() {
    this.isTripsLoaderVisible = true;
    this.isLoadMoreTripsVisible = false;
    this.tripsService.getTripsList(TRIPS_LOAD_PORTION + 1, this.tripsOfUser.length, null, null, null, [this.user.id]).subscribe(trips => {
      this.isTripsLoaderVisible = false;
      if (trips.length > TRIPS_LOAD_PORTION) {
        for (let i=0; i<TRIPS_LOAD_PORTION; i++) {
          this.tripsOfUser.push(trips[i]);
        }

        this.isLoadMoreTripsVisible = true;
      } else {
        for (let i=0; i<trips.length; i++) {
          this.tripsOfUser.push(trips[i]);
        }
      }
    }, error => {
      this.isTripsLoaderVisible = false;
      this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    })
  }
  
  private handleServerError(error) {
    this.messageService.showMessage("Ошибка от сервера: " + this.usersService.getFullErrorText(error), MessageButtons.ok, MessageIcon.error);
  }

  private isSupportedFileType(fileType: string): boolean {
    return (fileType == "image/jpeg") || (fileType == "image/png") || (fileType == "image/bmp");
  }

  private _loginChangeCounter: number = 0;

  private onNewLoginChanged() {
    this._loginChangeCounter++;
    let counterWhenLoginWasSet = this._loginChangeCounter;
    setTimeout(() => {
      if (this._loginChangeCounter == counterWhenLoginWasSet) {
        // Specified time passed since last input, now execute the handler
        if (this.newLogin) {
          this.usersService.getUserByName(this.newLogin.trim()).subscribe(user => {
            if (user && (user.id != this.user.id)) {
              this.isLoginAlreadyExistsVisible = true;
            } else {
              this.isLoginAlreadyExistsVisible = false;
            }
          });
        } else {
          this.isLoginAlreadyExistsVisible = false;
        }
      }
    }, 500);
  }

  private refreshAllVisibility() {
    if (this.user) {
      // For simplicity
      let isSelfAndNotGuest = (this.authService.user?.id == this.user.id) && (this.authService.user?.isGuest == false);

      this.imgSrc = userPicSrc(this.user.profilePicture, this.user.profilePictureFormat);
      if (this.user.profilePicture) {
        this.imgAlt = this.user.name;
        this.isResetProfilePicButtonVisible = (this.authService.user?.isAdmin) || isSelfAndNotGuest;
        this.changeProfilePicButtonCaption = "Изменить аватар";
      } else {
        this.imgAlt = "(без аватара)";
        this.isResetProfilePicButtonVisible = false;
        this.changeProfilePicButtonCaption = "Загрузить аватар";
      }

      this.isChangeProfilePicButtonVisible = (this.authService.user?.isAdmin) || isSelfAndNotGuest;
      this.notFound = false;

      this.canChangeLogin = isSelfAndNotGuest;
      if (this.user.lastChangedName) {
        let endDate = new Date(this.user.lastChangedName);
        endDate.setDate(endDate.getDate() + 6);
        this.canChangeLogin = this.canChangeLogin && ((new Date()) > endDate);
      }
      this.canChangeLogin = this.canChangeLogin || this.authService.user?.isAdmin;

      this.canChangePassword = isSelfAndNotGuest;
      this.canResetPassword = this.authService.user?.isAdmin;
      this.canSeePrivileges = this.authService.user?.isAdmin || (this.authService.user?.id == this.user.id); // guest also can see priviliges
      this.canEditPrivileges = this.authService.user?.isAdmin;
      this.canSeeIsAdmin = this.authService.user?.isAdmin;
      this.canSetIsAdmin = this.authService.user?.isAdmin && (this.authService.user?.id != this.user.id);
      this.canSeeIsGuest = this.authService.user?.isAdmin || (this.authService.user?.isGuest && (this.authService.user?.id == this.user.id));
      this.canDeleteUser = this.authService.user?.isAdmin && (this.authService.user?.id != this.user.id);
    } else {
      this.notFound = true;
      this.imgSrc = null;
      this.isChangeProfilePicButtonVisible = false;
      this.isResetProfilePicButtonVisible = false;
      this.canSeePrivileges = false;
      this.canEditPrivileges = false;
      this.canSeeIsAdmin = false;
      this.canSetIsAdmin = false;
      this.canSeeIsGuest = false;
      this.canSetIsGuest = false;
      this.canDeleteUser = false;
    }

    this.refreshCanSetIsGuest();

    this.isPictureLoaderVisible = false;
    this.isOverallLoaderVisible = false;
  }

  private refreshCanSetIsGuest() {
    if (this.user && (this.authService.user?.isGuest == false)) {
      this.canSetIsGuest = (!this.user.isAdmin) || this.user.isGuest; // be able to uncheck if accidentally is admin and guest simultaneously
    } else {
      this.canSetIsGuest = false;
    }
  }

  private loadVehicles() {
    this.isVehiclesLoaderVisible = true;
    this.vehiclesService.getVehiclesList([this.user.id]).subscribe(vehicles => {
      this.isVehiclesLoaderVisible = false;
      this.vehiclesOfUser = vehicles;
    }, error => {
      this.isVehiclesLoaderVisible = false;
      this.messageService.showMessage(this.vehiclesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }
}
