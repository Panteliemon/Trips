import { Component, OnInit } from '@angular/core';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { TripsService } from 'src/app/services/trips.service';
import { TripHeader } from 'src/app/models/trip-header';
import { AuthService } from 'src/app/services/auth.service';
import { getPictureUrl, inputStringToDate, dateToInputString } from 'src/app/stringUtils';
import { Router, ActivatedRoute } from '@angular/router';
import { PopupsService } from 'src/app/services/popups.service';
import { UserHeader } from 'src/app/models/user-header';
import { FilterOperation } from 'src/app/models/filter-operation';
import { PlaceHeader } from 'src/app/models/place-header';
import { UsersService } from 'src/app/services/users.service';
import { PlacesService } from 'src/app/services/places.service';

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
        this.startSearchOver();
      }
    }, 500);
  }

  isAdvancedSearchExpanded: boolean;

  searchDateFrom: string;
  searchDateTo: string;

  // Filters by entities:
  // Store entities and their ids separately, so when navigating to this page by URL,
  // we are able to initiate trips loading immediately, using only ids from filters,
  // and load corresponding entity headers later.
  usersFilter: UserHeader[] = [];
  usersFilterOperation: FilterOperation = FilterOperation.OR;
  private usersFilterIds: number[] = [];

  placesFilter: PlaceHeader[] = [];
  placesFilterOperation: FilterOperation = FilterOperation.OR;
  private placesFilterIds: number[] = [];

  trips: TripHeader[];

  constructor(private tripsService: TripsService, private messageService: MessageService, private authService: AuthService,
              private popupsService: PopupsService, private router: Router, private activatedRoute: ActivatedRoute,
              private usersService: UsersService, private placesService: PlacesService) { }

  ngOnInit(): void {
    this.isAddButtonVisible = this.authService.user?.canPublishTrips;

    // Parse the query values and setup params accordingly.
    this.parseAndSetRouteParams();

    // Launch main request first
    this.loadNextTripsPortion();

    // Then load entity headers for entity filters
    if (this.usersFilterIds.length > 0) {
      this.usersService.getUsersExact(this.usersFilterIds).subscribe(users => {
        // That's how we check that the data is not outdated (user didn't change user filter manually yet)
        if ((this.usersFilter.length == 0) && (this.usersFilterIds.length > 0)) { // this can only happen just after page load
          if (users) { // safety
            this.usersFilter = users;
            // And don't update anything and don't initiate the search, since everything is now how it should be.
          }
        }
      }, error => {
        // Don't tell anything, the main request probably will throw a messagebox. Reset filter:
        this.usersFilter = [];
        this.usersFilterIds = [];
      });
    }
    if (this.placesFilterIds.length > 0) {
      this.placesService.getPlacesExact(this.placesFilterIds).subscribe(places => {
        if ((this.placesFilter.length == 0) && (this.placesFilterIds.length > 0)) {
          if (places) {
            this.placesFilter = places;
          }
        }
      }, error => {
        this.placesFilter = [];
        this.placesFilterIds = [];
      });
    }
  }
 
  getMiniaturePicSrc(th: TripHeader): string {
    return this.tripsService.getMiniatureImgSrc(th);
  }

  getTripTitle(th: TripHeader): string {
    return this.tripsService.getDisplayableTripTitle(th);
  }

  addButtonClicked() {
    this.popupsService.placePicker.open("Выберите место для поездочки", (place) => {
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

  setSearchDateFrom(value: string) {
    if (value != this.searchDateFrom) {
      this.searchDateFrom = value;
      this.startSearchOver();
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
      this.startSearchOver();
    }
  }

  editSearchDateTo(value: string) {
    if (!value) {
      this.setSearchDateTo(value);
    }
  }

  usersFilterChanged() {
    this.usersFilterIds = this.usersFilter.map(u => u.id);
    this.startSearchOver();
  }

  setUsersFilterOperation(value: FilterOperation) {
    if (value != this.usersFilterOperation) {
      this.usersFilterOperation = value;
      this.startSearchOver();
    }
  }

  placesFilterChanged() {
    this.placesFilterIds = this.placesFilter.map(p => p.id);
    this.startSearchOver();
  }

  setPlacesFilterOperation(value: FilterOperation) {
    if (value != this.placesFilterOperation) {
      this.placesFilterOperation = value;
      this.startSearchOver();
    }
  }

  loadMoreButtonClicked() {
    this.loadNextTripsPortion();
  }

  // Sets search parameters from route data, but doesn't start the search.
  // This func is effectively a part of ngOnInit, so for specific circumstances only.
  private parseAndSetRouteParams() {
    if (this.activatedRoute.snapshot.paramMap.get("search")) {
      this.searchString = this.activatedRoute.snapshot.paramMap.get("search");
    }

    // Every param from Advanced section expands this section
    if (this.activatedRoute.snapshot.paramMap.get("from")) {
      this.searchDateFrom = dateToInputString(inputStringToDate(this.activatedRoute.snapshot.paramMap.get("from")));
      this.isAdvancedSearchExpanded = true;
    }
    if (this.activatedRoute.snapshot.paramMap.get("to")) {
      this.searchDateTo = dateToInputString(inputStringToDate(this.activatedRoute.snapshot.paramMap.get("to")));
      this.isAdvancedSearchExpanded = true;
    }

    // Filters by User and by Place: set ids and logical operation now, load corresponding headers later (not from this function)
    if (this.activatedRoute.snapshot.paramMap.get("users")) {
      let paramValue = this.activatedRoute.snapshot.paramMap.get("users");

      this.usersFilterOperation = (paramValue.indexOf("&") >= 0) ? FilterOperation.AND : FilterOperation.OR;
      this.usersFilterIds = paramValue.split((this.usersFilterOperation == FilterOperation.AND) ? "&" : "|").map(s => Number(s));

      this.isAdvancedSearchExpanded = true;
    }
    if (this.activatedRoute.snapshot.paramMap.get("places")) {
      let paramValue = this.activatedRoute.snapshot.paramMap.get("places");

      this.placesFilterOperation = (paramValue.indexOf("&") >= 0) ? FilterOperation.AND : FilterOperation.OR;
      this.placesFilterIds = paramValue.split((this.placesFilterOperation == FilterOperation.AND) ? "&" : "|").map(s => Number(s));

      this.isAdvancedSearchExpanded = true;
    }
  }

  private startSearchOver() {
    this.trips = [];

    // Renavigate with params (not renavigate of course, just set params)
    let parametersObj = <any>{};
    if (this.searchString) {
      parametersObj.search=this.searchString;
    }
    if (this.searchDateFrom) {
      parametersObj.from = this.searchDateFrom;
    }
    if (this.searchDateTo) {
      parametersObj.to = this.searchDateTo;
    }
    if (this.usersFilterIds.length > 0) {
      parametersObj.users = (this.usersFilterOperation == FilterOperation.AND)
        ? this.usersFilterIds.join("&")
        : this.usersFilterIds.join("|");
    }
    if (this.placesFilterIds.length > 0) {
      parametersObj.places = (this.placesFilterOperation == FilterOperation.AND)
        ? this.placesFilterIds.join("&")
        : this.placesFilterIds.join("|");
    }

    this.router.navigate(["/trips", parametersObj]);

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
    this.tripsService.getTripsList(LOAD_PORTION + 1, skip, this._searchString,
                                   inputStringToDate(this.searchDateFrom), inputStringToDate(this.searchDateTo),
                                   this.usersFilterIds, this.usersFilterOperation,
                                   this.placesFilterIds, this.placesFilterOperation).subscribe(result => {
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
