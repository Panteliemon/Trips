import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { TripsService } from 'src/app/services/trips.service';
import { TripHeader } from 'src/app/models/trip-header';
import { AuthService } from 'src/app/services/auth.service';
import { getPictureUrl } from 'src/app/stringUtils';
import { PlacePickerComponent } from '../../common/selectors/place-picker/place-picker.component';
import { Router } from '@angular/router';

const LOAD_PORTION = 20;

@Component({
  selector: 'app-trips-main',
  templateUrl: './trips-main.component.html',
  styleUrls: ['./trips-main.component.css']
})
export class TripsMainComponent implements OnInit {
  private _searchString: string;
  private _queryId: number;

  isOverallLoaderVisible: boolean;
  isListLoaderVisible: boolean;
  isAddButtonVisible: boolean;
  isLoadMoreButtonVisible: boolean;

  get searchString(): string { return this._searchString; }
  set searchString(value: string) {
    this._searchString = value;
    setTimeout(() => {
      if (this._searchString == value) {
        this.trips = [];
        this.loadNextTripsPortion();
      }
    }, 500);
  }

  isAdvancedSearchExpanded: boolean;

  trips: TripHeader[];

  @ViewChild("placePicker")
  placePicker: PlacePickerComponent;

  constructor(private tripsService: TripsService, private messageService: MessageService, private authService: AuthService,
              private router: Router) { }

  ngOnInit(): void {
    this.isAddButtonVisible = this.authService.user?.canPublishTrips;
    this.loadNextTripsPortion();
  }

  getMiniaturePicSrc(th: TripHeader): string {
    if (th?.titlePictureSmallSizeId) {
      return getPictureUrl(th.titlePictureSmallSizeId, th.titlePictureFormat);
    } else {
      return "/assets/no-pic-trip.png";
    }
  }

  addButtonClicked() {
    this.placePicker.open("Выберите место для поездочки", (place) => {
      this.isOverallLoaderVisible = true;
      this.tripsService.createTrip(place.id).subscribe(trip => {
        this.isOverallLoaderVisible = false;
        this.router.navigate([`/trip/${trip.id}`, { edit: true }])
      }, error => {
        this.isOverallLoaderVisible = false;
        this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
      });
    });
  }

  loadMoreButtonClicked() {
    this.loadNextTripsPortion();
  }

  // Loads next N trips to the list, given current search parameters
  private loadNextTripsPortion() {
    this._queryId++;
    let myQueryId = this._queryId;

    let skip: number = 0;
    if (this.trips) {
      skip = this.trips.length;
    } else {
      this.trips = [];
    }

    this.isListLoaderVisible = true;
    this.isLoadMoreButtonVisible = false;
    this.tripsService.getTripsList(LOAD_PORTION + 1, skip, this._searchString, null, null).subscribe(result => {
      this.isListLoaderVisible = false;
      // Ignore if result is outdated
      if (this._queryId != myQueryId) {
        if (result.length > LOAD_PORTION) {
          for (let i=0; i<LOAD_PORTION; i++) {
            this.trips.push(result[i]);
          }

          this.isLoadMoreButtonVisible = true;
        } else {
          for (let i=0; i<result.length; i++) {
            this.trips.push(result[i]);
          }
        }
      }
    }, error => {
      this.isListLoaderVisible = false;
      this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }
}
