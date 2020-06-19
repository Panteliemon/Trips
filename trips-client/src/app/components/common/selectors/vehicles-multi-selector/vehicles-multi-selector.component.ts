import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { VehicleHeader } from 'src/app/models/vehicle-header';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { PopupsService } from 'src/app/services/popups.service';

@Component({
  selector: 'app-vehicles-multi-selector',
  templateUrl: './vehicles-multi-selector.component.html',
  styleUrls: ['./vehicles-multi-selector.component.css']
})
export class VehiclesMultiSelectorComponent implements OnInit {
  @Input()
  selectedVehicles: VehicleHeader[];
  @Input()
  isEditable: boolean;

  @Output()
  added = new EventEmitter<VehicleHeader>();
  @Output()
  removed = new EventEmitter<VehicleHeader>();

  constructor(private vehiclesService: VehiclesService,
              private popupsService: PopupsService) { }

  ngOnInit(): void {
  }

  getMiniatureImgSrc(vehicle: VehicleHeader): string {
    return this.vehiclesService.getMiniatureImgSrc(vehicle);
  }

  getVehicleName(vehicle: VehicleHeader): string {
    return this.vehiclesService.getDisplayableVehicleName(vehicle);
  }

  deleteClicked(vehicle: VehicleHeader) {
    let index = this.selectedVehicles.findIndex(v => v.id == vehicle.id);
    if (index >= 0) {
      this.selectedVehicles.splice(index, 1);
      this.removed.emit(vehicle);
    }
  }

  addClicked() {
    this.popupsService.vehiclePicker.show("Выберите транспортное средство", vehicle => {
      this.selectedVehicles.push(vehicle);
      this.added.emit(vehicle);
    }, this.selectedVehicles);
  }
}
