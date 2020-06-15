import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PlaceHeader } from 'src/app/models/place-header';
import { PlacesService } from 'src/app/services/places.service';
import { PopupsService } from 'src/app/services/popups.service';

@Component({
  selector: 'app-places-multi-selector',
  templateUrl: './places-multi-selector.component.html',
  styleUrls: ['./places-multi-selector.component.css']
})
export class PlacesMultiSelectorComponent implements OnInit {
  @Input()
  selectedPlaces: PlaceHeader[] = [];
  @Input()
  isEditable: boolean = true;

  @Output()
  added = new EventEmitter<PlaceHeader>();
  @Output()
  removed = new EventEmitter<PlaceHeader>();

  constructor(private placesService: PlacesService, private popupsService: PopupsService) { }

  ngOnInit(): void {
  }

  getPlaceImgSrc(place: PlaceHeader) {
    return this.placesService.getMiniaturePicSrc(place);
  }

  getPlaceName(place: PlaceHeader) {
    return this.placesService.getDisplayablePlaceName(place.name);
  }

  deleteButtonClicked(place: PlaceHeader) {
    let index = this.selectedPlaces.findIndex(p => p.id == place.id);
    if (index >= 0) {
      this.selectedPlaces.splice(index, 1);
      this.removed.emit(place);
    }
  }

  addButtonClicked() {
    this.popupsService.placePicker.open("Добавить место в фильтр", place => {
      if (this.selectedPlaces) {
        this.selectedPlaces.push(place);
        this.added.emit(place);
      }
    }, this.selectedPlaces);
  }
}
