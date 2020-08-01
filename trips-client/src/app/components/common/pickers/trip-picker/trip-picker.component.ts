import { Component, OnInit } from '@angular/core';
import { TripHeader } from 'src/app/models/trip-header';
import { PopupsService } from 'src/app/services/popups.service';
import { TripsService } from 'src/app/services/trips.service';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { inputStringToDate } from 'src/app/stringUtils';

const TRIPS_PORTION_SIZE: number = 10;

@Component({
  selector: 'app-trip-picker',
  templateUrl: './trip-picker.component.html',
  styleUrls: ['./trip-picker.component.css']
})
export class TripPickerComponent implements OnInit {
  // Access through PopupsService.
  // Call open() when needed.

  isVisible: boolean;
  caption: string;

  isLoaderVisible: boolean;
  trips: TripHeader[];

  private _searchString: string;
  get searchString(): string {
    return this._searchString;
  }
  set searchString(value: string) {
    this._searchString = value;
    setTimeout(() => {
      if (this._searchString == value) {
        this.restartTripsSearch();
      }
    }, 500);
  }

  searchDateFrom: string;
  searchDateTo: string;

  private _queryId: number = 0;
  private onSelected: (value: TripHeader) => void;

  constructor(private popupsService: PopupsService, private tripsService: TripsService,
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.popupsService.registerTripPicker(this);
  }

  open(caption: string, onSelected: (value: TripHeader) => void) {
    this.caption = caption;
    this.onSelected = onSelected;
    this.isVisible = true;

    this._searchString = "";
    this.searchDateFrom = "";
    this.searchDateTo = "";
    this.restartTripsSearch();
  }

  setSearchDateFrom(value: string) {
    if (value != this.searchDateFrom) {
      this.searchDateFrom = value;
      this.restartTripsSearch();
    }
  }

  editSearchDateFrom(value: string) {
    // Only for clear button: don't need to react so fast in other cases
    if (!value) {
      this.setSearchDateFrom(value);
    }
  }

  setSearchDateTo(value: string) {
    if (value != this.searchDateTo) {
      this.searchDateTo = value;
      this.restartTripsSearch();
    }
  }

  editSearchDateTo(value: string) {
    if (!value) {
      this.setSearchDateTo(value);
    }
  }

  tripClicked(trip: TripHeader) {
    this.isVisible = false;
    if (this.onSelected) {
      this.onSelected(trip);
    }
  }

  cancelClicked() {
    this.isVisible = false;
  }

  getPictureSrc(trip: TripHeader): string {
    return this.tripsService.getMiniatureImgSrc(trip);
  }

  getTripName(trip: TripHeader): string {
    return this.tripsService.getDisplayableTripTitle(trip);
  }

  private restartTripsSearch() {
    this._queryId++;
    let currentQueryId = this._queryId;

    this.isLoaderVisible = true;
    this.tripsService.getTripsList(TRIPS_PORTION_SIZE, 0, this.searchString,
                                   inputStringToDate(this.searchDateFrom), inputStringToDate(this.searchDateTo)).subscribe(trips => {
      this.isLoaderVisible = false;
      
      // Only up-to-date responses
      if (currentQueryId == this._queryId) {
        this.trips = trips;
      }
    }, error => {
      this.isLoaderVisible = false;
      this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }
}
