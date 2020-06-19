import { Component, OnInit } from '@angular/core';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { PopupsService } from 'src/app/services/popups.service';
import { VehicleHeader } from 'src/app/models/vehicle-header';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';

@Component({
  selector: 'app-vehicle-picker',
  templateUrl: './vehicle-picker.component.html',
  styleUrls: ['./vehicle-picker.component.css']
})
export class VehiclePickerComponent implements OnInit {
  // Access through PopupsService.
  // Call show() when needed.

  isVisible: boolean;
  caption: string;
  isLoaderVisible: boolean;

  vehicles: VehicleHeader[];

  onSelected: (value: VehicleHeader) => void;
  excludeVehicles: VehicleHeader[];

  constructor(private vehiclesService: VehiclesService,
              private popupsService: PopupsService,
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.popupsService.registerVehiclePicker(this);
  }

  public show(caption: string, onSelected: (value: VehicleHeader) => void, excludeVehicles: VehicleHeader[] = null) {
    this.caption = caption;
    this.excludeVehicles = excludeVehicles;
    this.onSelected = onSelected;

    this.isVisible = true;
    this.reloadVehicles();
  }

  getMiniatureImgSrc(vehicle: VehicleHeader): string {
    return this.vehiclesService.getMiniatureImgSrc(vehicle);
  }

  getVehicleName(vehicle: VehicleHeader): string {
    return this.vehiclesService.getDisplayableVehicleName(vehicle);
  }

  rowClicked(vehicle: VehicleHeader) {
    this.isVisible = false;
    if (this.onSelected) {
      this.onSelected(vehicle);
    }
  }

  cancelClicked() {
    this.isVisible = false;
  }

  private reloadVehicles() {
    this.vehicles = [];
    this.isLoaderVisible = true;
    this.vehiclesService.getVehiclesList().subscribe(result => {
      this.isLoaderVisible = false;
      if (result) {
        this.vehicles = result.filter(v => this.isVehicleAcceptable(v));
      }
    }, error => {
      this.isLoaderVisible = false;
      this.messageService.showMessage(this.vehiclesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    })
  }

  private isVehicleAcceptable(vehicle: VehicleHeader): boolean {
    if (this.excludeVehicles) {
      return !this.excludeVehicles.find(v => v.id == vehicle.id);
    } else {
      return true;
    }
  }
}
