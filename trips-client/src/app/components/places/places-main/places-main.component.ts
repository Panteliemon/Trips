import { Component, OnInit } from '@angular/core';
import { PlacesService } from 'src/app/services/places.service';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { PlaceHeader } from 'src/app/models/place-header';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

const LOAD_PORTION = 20;

@Component({
  selector: 'app-places-main',
  templateUrl: './places-main.component.html',
  styleUrls: ['./places-main.component.css']
})
export class PlacesMainComponent implements OnInit {
  private _searchString: string;
  private _searchStringInputCounter: number = 0;
  private _fetchResetCounter: number = 0;

  places: PlaceHeader[] = [];

  get searchString(): string {
    return this._searchString;
  }
  set searchString(value: string) {
    this._searchString = value;
    this._searchStringInputCounter++;
    let counterWhenSet = this._searchStringInputCounter;
    setTimeout(() => {
      if (this._searchStringInputCounter == counterWhenSet) {
        this.startFetchPlacesWithCurrentSettings();
      }
    }, 500);
  }

  isOverallLoaderVisible: boolean;
  isPlacesLoaderVisible: boolean;
  isAddNewPlaceVisible: boolean;
  isLoadMorePlacesVisible: boolean;

  constructor(private placesService: PlacesService, private messageService: MessageService, private router: Router,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.startFetchPlacesWithCurrentSettings();
    this.isAddNewPlaceVisible = this.authService.user?.canEditGeography;
  }

  onAddNewPlaceClicked() {
    this.isOverallLoaderVisible = true;
    this.placesService.createPlace().subscribe(place => {
      this.isOverallLoaderVisible = false;
      this.router.navigate([`/place/${place.id}`, { edit: true }]);
    }, error => {
      this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
      this.isOverallLoaderVisible = false;
    })
  }

  onLoadMorePlacesClicked() {
    this.fetchMorePlaces();
  }

  getPlaceName(placeName: string) {
    return this.placesService.getDisplayablePlaceName(placeName);
  }

  // Initiates places loading
  private startFetchPlacesWithCurrentSettings() {
    this._fetchResetCounter++;
    this.places.length = 0;
    this.fetchMorePlaces();
  }

  private fetchMorePlaces() {
    let loadMorePlacesVisible = this.isLoadMorePlacesVisible;
    let fetchResetCounterWhenStarted = this._fetchResetCounter;
    this.isLoadMorePlacesVisible = false;
    this.isPlacesLoaderVisible = true;
    // Always take LOAD_PORTION+1 places, but show only LOAD_PORTION, so the extra 1 place
    // is needed to detect if we reached the end.
    this.placesService.getPlacesList(null, LOAD_PORTION + 1, this.places.length, this.searchString).subscribe(result => {
      if (this._fetchResetCounter == fetchResetCounterWhenStarted) {
        this.onPlacesArrived(result);
      } else {
        // Outdated, ignore.
      }
    }, error => {
      this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
      // restore previous state
      this.isLoadMorePlacesVisible = loadMorePlacesVisible;
      this.isPlacesLoaderVisible = false;
    });
  }

  private onPlacesArrived(newPlaces: PlaceHeader[]) {
    if (newPlaces.length <= LOAD_PORTION) {
      // That's last portion, no more "load more" button
      for (let i = 0; i<newPlaces.length; i++) {
        this.places.push(newPlaces[i]);
      }

      this.isPlacesLoaderVisible = false;
      this.isLoadMorePlacesVisible = false;
    } else {
      // Load only LOAD_PORTION places
      for (let i = 0; i<LOAD_PORTION; i++) {
        this.places.push(newPlaces[i]);
      }

      this.isPlacesLoaderVisible = false;
      // And show button that there are more
      this.isLoadMorePlacesVisible = true;
    }
  }
}
