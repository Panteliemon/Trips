import { Component, OnInit } from '@angular/core';
import { Vehicle } from 'src/app/models/vehicle';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { MessageService, MessageButtons, MessageIcon, MessageResult } from 'src/app/services/message.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getPictureUrl } from 'src/app/stringUtils';
import { AuthService } from 'src/app/services/auth.service';
import { UserHeader } from 'src/app/models/user-header';
import { PopupsService } from 'src/app/services/popups.service';
import { PlaceAccessibility } from 'src/app/models/place';
import { TripsService } from 'src/app/services/trips.service';
import { TripHeader } from 'src/app/models/trip-header';

const TRIPS_LOAD_PORTION: number = 20;

@Component({
  selector: 'app-vehicle-details',
  templateUrl: './vehicle-details.component.html',
  styleUrls: ['./vehicle-details.component.css']
})
export class VehicleDetailsComponent implements OnInit {
  vehicleId: number;
  vehicle: Vehicle;
  isNotFound: boolean;

  isOverallLoaderVisible: boolean;

  isEditMode: boolean;

  vehicleName: string;
  isEditButtonVisible: boolean;
  titlePictureImgSrc: string;
  isSelectTitlePicButtonVisible: boolean;
  isSelectTitlePicAdviceVisible: boolean;
  isResetTitlePicButtonVisible: boolean;
  isOwnerEditable: boolean;
  isGalleryVisible: boolean;

  gallerySelectedImage: string;

  areTripsVisible: boolean;
  tripsOfVehicle: TripHeader[] = [];
  isTripsLoaderVisible: boolean;
  isLoadMoreTripsVisible: boolean;

  private _isSetYearProcessing: boolean; // to avoid double messageboxes

  constructor(private vehiclesService: VehiclesService,
              private messageService: MessageService,
              private authService: AuthService,
              private popupsService: PopupsService,
              private tripsService: TripsService,
              private router: Router,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.vehicleId = +this.activatedRoute.snapshot.paramMap.get("id");
    this.isOverallLoaderVisible = true;
    this.vehiclesService.getVehicle(this.vehicleId).subscribe(vehicle => {
      this.isOverallLoaderVisible = false;
      this.setVehicle(vehicle);

      if (this.activatedRoute.snapshot.paramMap.get("edit") == "true") {
        if (this.getCanEditCurrentVehicle()) {
          this.setEditMode(true);
        } else {
          this.setEditMode(false);
          this.messageService.showMessage("У вас нет прав на редактирование");
        }
      } else {
        this.setEditMode(false);
      }

      // Initialize selected image to avoid angular conceptual error
      if (this.vehicle?.gallery?.pictures && (this.vehicle.gallery.pictures.length > 0)) {
        this.gallerySelectedImage = this.vehicle.gallery.pictures[0].smallSizeId;
      }

      // Decide whether or not display trips section
      if (this.vehicle) {
        this.tripsService.getTripsList(1, 0, null, null, null, [], null, [], null, [this.vehicleId]).subscribe(trips => {
          this.areTripsVisible = trips && (trips.length > 0);
        }); // on error ignore
      }
    }, error => {
      this.isOverallLoaderVisible = false;
      this.messageService.showMessage(this.vehiclesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }

  editButtonClicked() {
    this.setEditMode(true);
    this.renavigateWithParams();
  }

  endEditButtonClicked() {
    this.setEditMode(false);
    this.renavigateWithParams();
  }

  async deleteButtonClicked() {
    try {
      this.isOverallLoaderVisible = true;

      // Gather some statistics
      let trips = await this.tripsService.getTripsList(1, 0, null, null, null, [], null, [], null, [this.vehicleId]).toPromise();
      let hasTrips = trips && (trips.length > 0);
      let hasPics = this.vehicle?.gallery?.pictures && (this.vehicle.gallery.pictures.length > 0);

      this.isOverallLoaderVisible = false;

      let answer: MessageResult;
      if (hasPics) {
        if (hasTrips) {
          answer = await this.messageService.showMessage(`1. Данное транспортное средство участвует в ПОЕЗДОЧКАХ и будет автоматически исключено из каждой! 2. Надо бы понимать, что картинки из галереи тоже будут удолены.\r\nТочно удалить ${this.vehicleName}?`, MessageButtons.yesNo, MessageIcon.warning).toPromise();
          if (answer == MessageResult.yes) {
            answer = await this.messageService.showMessage("То, что вы собираетесь сделать, попахивает УДОЛИЗМОМ. Как всегда в таких случаях, нужно второе подтверждение.", MessageButtons.yesNo, MessageIcon.prokhanization).toPromise();
          }
        } else {
          answer = await this.messageService.showMessage(`Транспортное средство ${this.vehicleName} будет удалено со всеми загруженными в него картинками. Так, и что.\r\nУдалить ${this.vehicleName}?`, MessageButtons.yesNo, MessageIcon.warning).toPromise(); 
        }
      } else {
        if (hasTrips) {
          answer = await this.messageService.showMessage(`Данное транспортное средство участвует в ПОЕЗДОЧКАХ и будет автоматически исключено из каждой!\r\nТочно удалить ${this.vehicleName}?`, MessageButtons.yesNo, MessageIcon.warning).toPromise();
        } else {
          answer = await this.messageService.showMessage(`Удалить ${this.vehicleName}?`, MessageButtons.yesNo, MessageIcon.question).toPromise();
        }
      }

      if (answer == MessageResult.yes) {
        this.isOverallLoaderVisible = false;
        await this.vehiclesService.deleteVehicle(this.vehicleId).toPromise();

        this.router.navigate(["/vehicles"]);
        this.messageService.showMessage("УДОЛИЛ!11", MessageButtons.ok, (hasTrips || hasPics) ? MessageIcon.prokhanization : MessageIcon.info);
      }
    } catch (error) {
      this.isOverallLoaderVisible = false;
      // Error can come from trips service, but this would be just simple get operation, what could fail?
      // If connection is down then errors will pop from everywhere, so it's not important which message we will show.
      // But in case of error that we might expect - treating as vehicles service error is relevant.
      this.messageService.showMessage(this.vehiclesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    }
  }

  setTitlePicButtonClicked() {
    this.popupsService.fromGalleryPicker.open([this.vehicle?.gallery], this.vehicle?.titlePicture?.smallSizeId, pic => {
      this.vehicle.titlePicture = pic;
      this.refreshTitlePictureImgSrc();
      this.refreshSelectTitlePicButtons();
      this.silentUpdate();
    });
  }

  resetTitlePicButtonClicked() {
    this.messageService.showMessage("Сбросить заглавную картинку?", MessageButtons.yesNo, MessageIcon.question).subscribe(answer => {
      if (answer == MessageResult.yes) {
        this.vehicle.titlePicture = null;
        this.refreshTitlePictureImgSrc();
        this.refreshSelectTitlePicButtons();
        this.silentUpdate();
      }
    });
  }

  setOwner(value: UserHeader) {
    if (value?.id != this.vehicle.owner?.id) {
      this.vehicle.owner = value;
      this.silentUpdate();
    }
  }

  setName(value: string) {
    if (value != this.vehicle.name) {
      this.vehicle.name = value;
      this.refreshVehicleName();
      this.silentUpdate();
    }
  }

  setOfficialName(value: string) {
    if (value != this.vehicle.officialName) {
      this.vehicle.officialName = value;
      this.silentUpdate();
    }
  }

  setLicenseNumber(value: string) {
    if (value != this.vehicle.licenseNumber) {
      this.vehicle.licenseNumber = value;
      this.silentUpdate();
    }
  }

  async setYear(strValue: string) {
    let iValue = (strValue) ? Math.round(+strValue) : null;
    if ((iValue != this.vehicle.yearOfManufacture) && (!this._isSetYearProcessing)) {
      this._isSetYearProcessing = true;
      if ((iValue != null) && (iValue < 1970)) {
        await this.messageService.showMessage("Раритет!", MessageButtons.ok, MessageIcon.info).toPromise();
        await this.messageService.showMessage("Нет.").toPromise();
      } else if ((iValue != null) && (iValue > (new Date()).getFullYear())) {
        await this.messageService.showMessage("Год больше текущего.").toPromise();
      } else {
        this.vehicle.yearOfManufacture = iValue;
        this.silentUpdate();
      }

      this._isSetYearProcessing = false;
    }
  }

  setDescription(value: string) {
    if (value != this.vehicle.description) {
      this.vehicle.description = value;
      this.silentUpdate();
    }
  }

  setAcceptableAccessibility(value: PlaceAccessibility) {
    if (value != this.vehicle.acceptableAccessibility) {
      this.vehicle.acceptableAccessibility = value;
      this.silentUpdate();
    }
  }

  async galleryFileSelected(file: File) {
    try {
      this.isOverallLoaderVisible = true;
      let pic = await this.vehiclesService.uploadPicture(this.vehicleId, file).toPromise();

      // Set selected picture only works if picture exists, so we have to add first
      this.vehicle.gallery.pictures?.push(pic);
      this.gallerySelectedImage = pic?.smallSizeId;

      // Reread all
      let vehicle = await this.vehiclesService.getVehicle(this.vehicleId).toPromise();
      this.setVehicle(vehicle);

      this.isOverallLoaderVisible = false;

      // Auto set title pic
      if (!this.vehicle.titlePicture) {
        this.vehicle.titlePicture = pic;
        this.refreshTitlePictureImgSrc();
        this.refreshSelectTitlePicButtons();
        this.silentUpdate();
      }
    } catch (error) {
      this.isOverallLoaderVisible = false;
      this.messageService.showMessage(this.vehiclesService.getServerErrorText(error), MessageButtons.ok,
        this.vehiclesService.getServerErrorIcon(error));
    }
  }

  galleryUpdateRequested() {
    this.silentUpdate(true);
  }

  async galleryDeleteConfirmed(index: number) {
    if (this.vehicle.gallery?.pictures && (index >= 0) && (index < this.vehicle.gallery.pictures.length)) { // always should be true
      try {
        this.isOverallLoaderVisible = true;

        await this.vehiclesService.deletePicture(this.vehicleId, this.vehicle.gallery.pictures[index].smallSizeId).toPromise();

        // Make some preparations to select "the next" picture, or the last
        this.vehicle.gallery.pictures.splice(index, 1);
        if (index < this.vehicle.gallery.pictures.length) {
          this.gallerySelectedImage = this.vehicle.gallery.pictures[index].smallSizeId;
        } else {
          if (this.vehicle.gallery.pictures.length > 0) {
            this.gallerySelectedImage = this.vehicle.gallery.pictures[this.vehicle.gallery.pictures.length - 1].smallSizeId;
          } else {
            this.gallerySelectedImage = null;
          }
        }

        // Reread all
        let vehicle = await this.vehiclesService.getVehicle(this.vehicleId).toPromise();
        this.setVehicle(vehicle);

        this.isOverallLoaderVisible = false;
      } catch (error) {
        this.isOverallLoaderVisible = false;
        this.messageService.showMessage(this.vehiclesService.getServerErrorText(error), MessageButtons.ok,
          this.vehiclesService.getServerErrorIcon(error));
      }
    }
  }

  tripsExpandedChanged(isExpanded: boolean) {
    if (isExpanded && ((!this.tripsOfVehicle) || (this.tripsOfVehicle.length == 0))) {
      this.tripsOfVehicle = [];
      this.loadMoreTripsClicked();
    }
  }

  getTripImgSrc(trip: TripHeader): string {
    return this.tripsService.getMiniatureImgSrc(trip);
  }

  getTripTitle(trip: TripHeader): string {
    return this.tripsService.getDisplayableTripTitle(trip);
  }

  loadMoreTripsClicked() {
    this.isLoadMoreTripsVisible = false;
    this.isTripsLoaderVisible = true;
    this.tripsService.getTripsList(TRIPS_LOAD_PORTION + 1, this.tripsOfVehicle.length, null, null, null, [], null, [], null, [this.vehicleId]).subscribe(trips => {
      this.isTripsLoaderVisible = false;
      if (trips) { // should be always true
        if (trips.length > TRIPS_LOAD_PORTION) {
          this.isLoadMoreTripsVisible = true;
          for (let i=0; i<TRIPS_LOAD_PORTION; i++) {
            this.tripsOfVehicle.push(trips[i]);
          }
        } else {
          for (let i=0; i<trips.length; i++) {
            this.tripsOfVehicle.push(trips[i]);
          }
        }
      }
    }, error => {
      this.isTripsLoaderVisible = false;
      this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }

  private setVehicle(value: Vehicle) {
    this.vehicle = value;
    if (this.vehicle) {
      this.isNotFound = false;

      this.refreshVehicleName();
      this.refreshTitlePictureImgSrc();
      this.refreshSelectTitlePicButtons();
    } else {
      this.isNotFound = true;
    }
  }

  private setEditMode(value: boolean) {
    this.isEditMode = value;
    if (value) {
      this.isEditButtonVisible = false;
      this.isOwnerEditable = !!this.authService.user?.isAdmin;
    } else {
      this.isEditButtonVisible = this.getCanEditCurrentVehicle();
      this.isOwnerEditable = false;
    }

    this.refreshGalleryVisible();
    this.refreshSelectTitlePicButtons();
  }

  private renavigateWithParams() {
    let parametersObj = <any>{};
    if (this.isEditMode) {
      parametersObj.edit = "true";
    }

    this.router.navigate([`/vehicle/${this.vehicleId}`, parametersObj])
  }

  private getCanEditCurrentVehicle(): boolean {
    if (this.vehicle && this.authService.user) {
      return this.authService.user.isAdmin || (this.vehicle.owner?.id == this.authService.user.id);
    } else {
      return false;
    }
  }

  private refreshVehicleName() {
    this.vehicleName = this.vehiclesService.getDisplayableVehicleName(this.vehicle);
  }

  private refreshTitlePictureImgSrc() {
    if (this.vehicle?.titlePicture) {
      this.titlePictureImgSrc = getPictureUrl(this.vehicle.titlePicture.mediumSizeId, this.vehicle.titlePicture.format);
    } else {
      this.titlePictureImgSrc = "/assets/no-pic-vehicle.png";
    }
  }

  private refreshSelectTitlePicButtons() {
    if (this.isEditMode) {
      let hasAnyPictures = this.vehicle?.gallery?.pictures && (this.vehicle.gallery.pictures.length > 0);
      this.isSelectTitlePicButtonVisible = hasAnyPictures;
      this.isSelectTitlePicAdviceVisible = !hasAnyPictures;

      this.isResetTitlePicButtonVisible = !!this.vehicle?.titlePicture;
    } else {
      this.isSelectTitlePicButtonVisible = false;
      this.isResetTitlePicButtonVisible = false;
      this.isSelectTitlePicAdviceVisible = false;
    }
  }

  private refreshGalleryVisible() {
    this.isGalleryVisible = this.isEditMode || (this.vehicle?.gallery?.pictures && (this.vehicle.gallery.pictures.length > 0));
  }

  private silentUpdate(withGallery: boolean = false) {
    let shallowCopy: Vehicle = Object.assign({}, this.vehicle);
    if (!withGallery) {
      shallowCopy.gallery = null;
    }

    this.vehiclesService.updateVehicle(shallowCopy).subscribe(() => { }, error => {
      this.messageService.showMessage(this.vehiclesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }
}
