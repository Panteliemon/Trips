import { Component, OnInit } from '@angular/core';
import { MessageService, MessageButtons, MessageIcon, MessageResult } from 'src/app/services/message.service';
import { PopupsService } from 'src/app/services/popups.service';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { VehicleHeader } from 'src/app/models/vehicle-header';
import { AuthService } from 'src/app/services/auth.service';
import { stringify } from 'querystring';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicles-main',
  templateUrl: './vehicles-main.component.html',
  styleUrls: ['./vehicles-main.component.css']
})
export class VehiclesMainComponent implements OnInit {
  vehicles: VehicleHeader[];
  isLoaderVisible: boolean;
  isNotFoundVisible: boolean;

  isOverallLoaderVisible: boolean; // for create new vehicle only

  constructor(private messageService: MessageService,
              private popupsService: PopupsService,
              private vehiclesService: VehiclesService,
              private authService: AuthService,
              private router: Router) { }

  ngOnInit(): void {
    this.isLoaderVisible = true;
    this.vehiclesService.getVehiclesList().subscribe(vehicles => {
      this.isLoaderVisible = false;
      this.vehicles = vehicles;
      this.isNotFoundVisible = (!this.vehicles) || (this.vehicles.length == 0);
    }, error => {
      this.isLoaderVisible = false;
      this.messageService.showMessage(this.vehiclesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }

  addButtonClicked() {
    if (this.authService.user) {
      let question: string;
      if (this.authService.user.isAdmin) {
        question = "Добавить транспортное средство?";
      } else {
        question = "Добавить транспортное средство?\r\nВладельцем будете вы.";
      }

      this.messageService.showMessage(question, MessageButtons.yesNo, MessageIcon.question).subscribe(answer => {
        if (answer == MessageResult.yes) {
          this.isOverallLoaderVisible = true;
          this.vehiclesService.createVehicle(this.authService.user.isAdmin ? null : this.authService.user.id).subscribe(vehicle => {
            this.isOverallLoaderVisible = false;
            if (vehicle != null) { // should be always
              this.router.navigate([`/vehicle/${vehicle.id}`, { edit: true }]);
            }
          }, error => {
            this.isOverallLoaderVisible = false;
            this.messageService.showMessage(this.vehiclesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
          });
        }
      });
    }
  }

  getMiniatureImgSrc(vehicle: VehicleHeader) {
    return this.vehiclesService.getMiniatureImgSrc(vehicle);
  }

  getVehicleName(vehicle: VehicleHeader) {
    return this.vehiclesService.getDisplayableVehicleName(vehicle);
  }
}
