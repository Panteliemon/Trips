import { Component, OnInit } from '@angular/core';
import { PlaceHeader } from 'src/app/models/place-header';
import { PlacesService } from 'src/app/services/places.service';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { getPictureUrl } from 'src/app/stringUtils';
import { PopupsService } from 'src/app/services/popups.service';

const PLACES_PORTION_SIZE: number = 10;

@Component({
  selector: 'app-place-picker',
  templateUrl: './place-picker.component.html',
  styleUrls: ['./place-picker.component.css']
})
export class PlacePickerComponent implements OnInit {
  // Access through PopupsService.
  // Call open() when needed.

  private _searchString: string;
  private _queryId: number = 0;

  isVisible: boolean;
  caption: string;
  
  get searchString(): string { return this._searchString; }
  set searchString(value: string) {
    this._searchString = value;
    // Wait
    setTimeout(() => {
      if (this._searchString == value) {
        this.startFetchPlaces();
      }
    }, 500);
  }

  places: PlaceHeader[];
  isLoading: boolean;

  onSelected: (value: PlaceHeader) => void;
  onCancel: () => void;

  constructor(private placesService: PlacesService, private messageService: MessageService, private popupsService: PopupsService) { }

  ngOnInit(): void {
    this.popupsService.registerPlacePicker(this);
  }

  open(caption: string, onSelected: (value: PlaceHeader) => void, onCancel: () => void = null) {
    this.isVisible = true;
    this.caption = caption;
    this.onSelected = onSelected;
    this.onCancel = onCancel;

    this.places = [];
    this._searchString = "";
    this.startFetchPlaces();
  }

  cancelClicked() {
    this.isVisible = false;
    if (this.onCancel) {
      this.onCancel();
    }
  }

  placeClicked(place: PlaceHeader) {
    this.isVisible = false;
    if (this.onSelected) {
      this.onSelected(place);
    }
  }

  getPictureSrc(place: PlaceHeader) {
    if (place && place.titlePictureSmallSizeId) {
      return getPictureUrl(place.titlePictureSmallSizeId, place.titlePictureFormat);
    } else {
      return "/assets/no-pic-place.png";
    }
  }

  getPlaceName(place: PlaceHeader) {
    return this.placesService.getDisplayablePlaceName(place?.name);
  }

  private startFetchPlaces() {
    this._queryId++;
    let myQueryId = this._queryId;

    // We have no "load next N" functionality here, for religious reasons.
    // So just load first N every time.
    this.isLoading = true;
    this.places = [];
    this.placesService.getPlacesList("name", PLACES_PORTION_SIZE, 0, this._searchString).subscribe(places => {
      this.isLoading = false;
      // Apply if result is not outdated
      if (this._queryId == myQueryId) {
        this.places = places;
      }
    }, error => {
      this.isLoading = false;
      this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }
}
