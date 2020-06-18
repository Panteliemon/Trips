import { Component, OnInit } from '@angular/core';
import { Vehicle } from 'src/app/models/vehicle';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getPictureUrl } from 'src/app/stringUtils';
import { AuthService } from 'src/app/services/auth.service';
import { UserHeader } from 'src/app/models/user-header';

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
  isOwnerEditable: boolean;

  constructor(private vehiclesService: VehiclesService,
              private messageService: MessageService,
              private authService: AuthService,
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

  deleteButtonClicked() {

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

  private setVehicle(value: Vehicle) {
    this.vehicle = value;
    if (this.vehicle) {
      this.isNotFound = false;

      this.refreshVehicleName();
      this.refreshTitlePictureImgSrc();
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
