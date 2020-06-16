import { Component, OnInit } from '@angular/core';
import { Place, PlaceKind, PlaceAccessibility, PlacePopularity, PlaceCapacity } from 'src/app/models/place';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from 'src/app/services/places.service';
import { MessageService, MessageButtons, MessageIcon, MessageResult } from 'src/app/services/message.service';
import { AuthService } from 'src/app/services/auth.service';
import { dateToInputString, inputStringToDate, possibleStringToDate, createGoogleRefFromLocation, getPictureUrl } from 'src/app/stringUtils';
import { PopupsService } from 'src/app/services/popups.service';
import { TripsService } from 'src/app/services/trips.service';
import { FilterOperation } from 'src/app/models/filter-operation';
import { TripHeader } from 'src/app/models/trip-header';

const LOAD_TRIPS_PORTION: number = 20;

@Component({
  selector: 'app-place-details',
  templateUrl: './place-details.component.html',
  styleUrls: ['./place-details.component.css']
})
export class PlaceDetailsComponent implements OnInit {
  place: Place;

  isEditMode: boolean;

  isOverallLoaderVisible: boolean;
  isNotFound: boolean;

  titlePicSrc: string;
  mapRef: string;

  isEditButtonVisible: boolean;
  isAccessibilityVisible: boolean;
  isNearestAccessibilityVisible: boolean;
  isPopularityVisible: boolean;
  isCapacityVisible: boolean;
  isGalleryVisible: boolean;
  isSelectTitlePicButtonVisible: boolean;
  isSelectTitlePicLabelVisible: boolean;
  isXBApprovalCheckboxVisible: boolean;

  gallerySelectedPictureSmallSizeId: string;

  private _suppressDiscoveryDateInput: boolean = false;

  areTripsToHereVisible: boolean;
  tripsToHere: TripHeader[];
  isTripsLoaderVisible: boolean;
  isLoadMoreTripsVisible: boolean;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private placesService: PlacesService,
    private tripsService: TripsService,
    private messageService: MessageService,
    private popupsService: PopupsService,
    private authService: AuthService) { }

  get placeKind(): PlaceKind {
    return this.place.kind;
  }
  set placeKind(value: PlaceKind) {
    this.place.kind = value;
    this.refreshSelectorsVisible();
    this.initiatePartialSilentUpdate();
  }

  get placeAccessibility(): PlaceAccessibility {
    return this.place.accessibility;
  }
  set placeAccessibility(value: PlaceAccessibility) {
    this.place.accessibility = value;
    if (this.place.nearestAccessibility > this.place.accessibility) {
      this.place.nearestAccessibility = this.place.accessibility;
    }
    this.refreshSelectorsVisible();
    this.initiatePartialSilentUpdate();
  }

  get placeNearestAccessibility(): PlaceAccessibility {
    return this.place.nearestAccessibility;
  }
  set placeNearestAccessibility(value: PlaceAccessibility) {
    this.place.nearestAccessibility = value;
    this.initiatePartialSilentUpdate();
  }

  get placePopularity(): PlacePopularity {
    return this.place.popularity;
  }
  set placePopularity(value: PlacePopularity) {
    this.place.popularity = value;
    this.initiatePartialSilentUpdate();
  }

  get placeCapacity(): PlaceCapacity {
    return this.place.capacity;
  }
  set placeCapacity(value: PlaceCapacity) {
    this.place.capacity = value;
    this.initiatePartialSilentUpdate();
  }

  get placeDiscoveryDate(): string {
    return dateToInputString(this.place.discoveryDate);
  }

  async setPlaceDiscoveryDate(value: string) {
    let dValue = inputStringToDate(value);
    if (possibleStringToDate(this.place.discoveryDate)?.getTime() != dValue?.getTime()) {
      // When value changed by enter and messagebox appears, we immediately receive blur event,
      // so messagebox appears second time. Use this workaroud to prevent:
      if (!this._suppressDiscoveryDateInput) {
        this._suppressDiscoveryDateInput = true;
        if (dValue && this.place.addedDate && (dValue > possibleStringToDate(this.place.addedDate))) {
          await this.messageService.showMessage("Место не может быть открыто позже, чем добавлено сюда.").toPromise();
        } else if (dValue && (dValue > (new Date()))) {
          await this.messageService.showMessage("Дата больше чем сегодня").toPromise();
        } else if (dValue && (dValue < new Date(2014, 7, 8))) { // I guess that 8 Aug 2014
          await this.messageService.showMessage("Введенная дата - это слишком давно. Введите плз что-либо из периода эпохи поездочек.").toPromise();
        } else {
          this.place.discoveryDate = dValue;
          this.initiatePartialSilentUpdate();
        }
        this._suppressDiscoveryDateInput = false;
      }
    }
  }

  placeDiscoveryDateChanged(value: string) {
    // React only on clear here
    if (!value) {
      this.setPlaceDiscoveryDate(value);
    }
  }

  get isXBApproved(): boolean {
    return this.place.isXBApproved;
  }
  set isXBApproved(value: boolean) {
    if (value != this.place.isXBApproved) {
      this.place.isXBApproved = value;
      this.initiatePartialSilentUpdate();
    }
  }

  setPlaceName(value: string) {
    let changed = this.place.name != value;
    this.place.name = value;
    if (changed && (!value)) {
      this.messageService.showMessage("Всё же неплохо бы, чтобы имя не было пустым. Так будет легче найти данное место поиском, и т.д.", MessageButtons.ok, MessageIcon.info);
    }

    this.initiatePartialSilentUpdate();
  }

  setPlaceDescription(value: string) {
    if (value != this.place.description) {
      this.place.description = value;
      this.initiatePartialSilentUpdate();
    }
  }

  setPlaceLocation(value: string) {
    if (value != this.place.location) {
      this.place.location = value;
      this.updateMapRef();
      this.initiatePartialSilentUpdate();
    }
  }

  ngOnInit(): void {
    let placeId = +this.route.snapshot.paramMap.get("id");
    this.isOverallLoaderVisible = true;
    this.placesService.getPlace(placeId).subscribe(place => {
      this.place = place;
      if (!place) {
        this.isNotFound = true;
      } else {
        // Avoid "expression changed after it has been checked" situation
        this.gallerySelectedPictureSmallSizeId = this.place?.gallery?.pictures[0]?.smallSizeId || null;
      }
      this.refreshTitlePicSrc();
      this.refreshSelectorsVisible();
      this.refreshGalleryVisible();
      this.updateMapRef();
      this.isOverallLoaderVisible = false;

      if (this.authService.user?.canEditGeography) {
        this.isEditButtonVisible = true;
        if (this.route.snapshot.paramMap.get("edit") == "true") {
          this.onEditClicked();
        }
      } else {
        this.isEditButtonVisible = false;
        if (this.route.snapshot.paramMap.get("edit") == "true") {
          this.messageService.showMessage("У вас нет прав на редактирование");
        }
      }

      // Decide once and forever, if we display "trips to here" section
      if (this.place) {
        this.tripsService.getTripsList(1, 0, null, null, null, null, null, [this.place.id]).subscribe(trips => {
          this.areTripsToHereVisible = trips && (trips.length > 0);
        }); // on error ignore
      }
    }, error => {
      this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
      // Nothing is visible. Display empty page.
      this.isOverallLoaderVisible = false;
    });
  }

  onEditClicked() {
    // Set "edit" parameter in url
    if (!this.route.snapshot.paramMap.get("edit")) {
      this.router.navigate([`/place/${this.place.id}`, {edit: true}]);
    }

    this.isEditMode = true;
    this.refreshGalleryVisible();
    this.refreshSelectTitlePicVisible();
    this.refreshXBApprovalCheckboxVisible();
  }

  onEndEditClicked() {
    if (this.route.snapshot.paramMap.get("edit")) {
      this.router.navigate([`/place/${this.place.id}`]);
      // This action doesn't actually reload the page, since url not changed,
      // but it clears the "edit" parameter, and that's exactly what we need.
    }

    this.isEditMode = false;
    this.refreshGalleryVisible();
    this.refreshSelectTitlePicVisible();
    this.refreshXBApprovalCheckboxVisible()
  }

  onDeleteClicked() {
    // Gather some statistics before ask
    this.isOverallLoaderVisible = true;
    this.tripsService.getTripsList(1, 0, null, null, null, null, null, [this.place.id]).subscribe(async result => {
      this.isOverallLoaderVisible = false;
      let hasVisits = result.length > 0;

      let answer: boolean;
      if (hasVisits) {
        answer = (await this.messageService.showMessage(`Собираемся удалить ${this.getPlaceName()}. ВНИМАНИЕ: в данное место есть ПОЕЗДОЧКИ! Строго говоря, вы должны понимать последствия содеянного. Удолизм у нас тут не приветствуется. Так, и что.`,
                                                        MessageButtons.yesNo, MessageIcon.seriously,
                                                        "То, что ты говоришь - это очень серьёзно").toPromise()) == MessageResult.yes;
      } else {
        if (this.place.gallery.pictures.length == 0) {
          answer = (await this.messageService.showMessage(`Удалить ${this.getPlaceName()}?`,
                                                          MessageButtons.yesNo, MessageIcon.warning).toPromise()) == MessageResult.yes;
        } else {
          answer = (await this.messageService.showMessage(`${this.getPlaceName()} будет удалено со всеми картинками. ЛИЧНО удаляем данное место?`,
                                                          MessageButtons.yesNo, MessageIcon.seriously,
                                                          "То, что ты говоришь - это очень серьёзно!").toPromise()) == MessageResult.yes;
        }
      }

      let deleteVisits = false;
      if (answer && hasVisits) {
        let canEditTrips = this.authService.user?.canPublishTrips;
        if (canEditTrips) {
          let result2 = await this.messageService.showMessage("Удалить все упоминания данного места из поездочек? (Да - удалить (соотв. галереи с картинками в них тоже будут удалены!), Нет - галереи и данные останутся, но имя места пропадёт, Отмена - передумал вообще удалять место (рекомендуемый вариант))",
                                                              MessageButtons.yesNoCancel, MessageIcon.warning).toPromise();
          if (result2 == MessageResult.cancel) {
            answer = false;
          } else if (result2 == MessageResult.yes) {
            deleteVisits = true;
          }
        } else {
          answer = (await this.messageService.showMessage("У вас нет прав на редактирование поездочек, поэтому галереи и данные по данному месту не будут удалены, но имя места пропадёт. Подтверждаем удаление?",
                                                          MessageButtons.yesNo, MessageIcon.warning).toPromise()) == MessageResult.yes;
        }
      }

      if (answer) {
        // Well, start deleting process
        try {
          this.isOverallLoaderVisible = true;
          await this.placesService.deletePlace(this.place.id, deleteVisits).toPromise();
          this.isOverallLoaderVisible = false;

          this.router.navigate(["/places"]);
          this.messageService.showMessage("УДОЛИЛ!!1", MessageButtons.ok,
                                          hasVisits || (this.place.gallery.pictures.length > 0)
                                          ? MessageIcon.prokhanization : MessageIcon.info);
        } catch (error) {
          this.isOverallLoaderVisible = false;
          this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
        }
      } else {
        this.isOverallLoaderVisible = false;
      }
    }, error => {
      this.isOverallLoaderVisible = false;
      this.messageService.showMessage("Не получится удалить, так как сервер не может получить данные из-за ошибки: " + this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }

  onChangeTitlePicClicked() {
    this.popupsService.fromGalleryPicker.open([this.place.gallery], this.place?.titlePicture?.smallSizeId, pic => {
      if (pic?.smallSizeId != this.place.titlePicture?.smallSizeId) {
        this.place.titlePicture = pic;
        this.refreshTitlePicSrc();
        this.initiatePartialSilentUpdate();
      }
    });
  }

  onResetTitlePicClicked() {
    if (this.place.titlePicture) {
      this.messageService.showMessage("Сбросить картинку?", MessageButtons.yesNo, MessageIcon.question).subscribe(result => {
        if (result == MessageResult.yes) {
          this.place.titlePicture = null;
          this.refreshTitlePicSrc();
          this.initiatePartialSilentUpdate();
        }
      });
    }
  }

  onGalleryAddFile(file: File) {
    this.isOverallLoaderVisible = true;
    this.placesService.uploadPicture(this.place.id, file).subscribe(pic => {
      // We will not reread the place, just append recieved image entry to the end of the gallery
      this.place.gallery.pictures.push(pic);
      this.gallerySelectedPictureSmallSizeId = pic.smallSizeId;
      this.isOverallLoaderVisible = false;
      this.refreshSelectTitlePicVisible();

      // If the first image, then auto-set as title picture
      if ((this.place.gallery.pictures.length == 1) && (!this.place.titlePicture)) {
        this.place.titlePicture = this.place.gallery.pictures[0];
        this.refreshTitlePicSrc();
        this.initiatePartialSilentUpdate();
      }
    }, error => {
      this.isOverallLoaderVisible = false;
      this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, this.placesService.getServerErrorIcon(error));
    });
  }

  onGalleryUpdateRequested() {
    this.initiateFullSilentUpdate();
  }

  onGalleryDeleteConfirmed(index: number) {
    let deletedPicture = this.place.gallery.pictures[index];
    this.isOverallLoaderVisible = true;
    this.placesService.deletePicture(this.place.id, deletedPicture.smallSizeId).subscribe(() => {
      this.isOverallLoaderVisible = false;
      this.place.gallery.pictures.splice(index, 1);
      
      if (index < this.place.gallery.pictures.length) {
        this.gallerySelectedPictureSmallSizeId = this.place.gallery.pictures[index].smallSizeId;
      } else {
        if (this.place.gallery.pictures.length > 0) {
          this.gallerySelectedPictureSmallSizeId = this.place.gallery.pictures[this.place.gallery.pictures.length - 1].smallSizeId;
        } else {
          // Not necessary by logic, but need to do something with gallery for it to update.
          this.gallerySelectedPictureSmallSizeId = null;
        }
      }

      this.refreshSelectTitlePicVisible();
      if (this.place.titlePicture.smallSizeId == deletedPicture.smallSizeId) {
        this.place.titlePicture = null;
        this.refreshTitlePicSrc();
      }
    }, error => {
      this.isOverallLoaderVisible = false;
      this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }

  getPlaceName() {
    return this.placesService.getDisplayablePlaceName(this.place.name);
  }

  onTripsToHereExpandedChanged(isExpanded: boolean) {
    if (isExpanded && ((!this.tripsToHere) || (this.tripsToHere.length == 0))) {
      this.tripsToHere = [];
      this.onLoadMoreTripsClicked();
    }
  }

  getTripImgSrc(trip: TripHeader): string {
    return this.tripsService.getMiniatureImgSrc(trip);
  }

  getTripTitle(trip: TripHeader): string {
    return this.tripsService.getDisplayableTripTitle(trip);
  }

  onLoadMoreTripsClicked() {
    this.isTripsLoaderVisible = true;
    this.isLoadMoreTripsVisible = false;
    this.tripsService.getTripsList(LOAD_TRIPS_PORTION + 1, this.tripsToHere.length, null, null, null, null, null, [this.place.id]).subscribe(trips => {
      this.isTripsLoaderVisible = false;
      if (trips.length > LOAD_TRIPS_PORTION) {
        for (let i=0; i<LOAD_TRIPS_PORTION; i++) {
          this.tripsToHere.push(trips[i]);
        }

        this.isLoadMoreTripsVisible = true;
      } else {
        for (let i=0; i<trips.length; i++) {
          this.tripsToHere.push(trips[i]);
        }
      }
    }, error => {
      this.isTripsLoaderVisible = false;
      this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }

  // Updates the place without sending gallery data to server (minimize traffic)
  // Silent: without loader
  private initiatePartialSilentUpdate() {
    let withoutGallery: Place = Object.assign({}, this.place);
    withoutGallery.gallery = null;
    this.placesService.updatePlace(withoutGallery).subscribe(() => {}, error => {
      this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }

  // Updates the place with sending gallery data to server
  // Silent: without loader
  private initiateFullSilentUpdate() {
    this.placesService.updatePlace(this.place).subscribe(() => {}, error => {
      this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }

  private refreshTitlePicSrc() {
    if (this.place?.titlePicture) {
      this.titlePicSrc = getPictureUrl(this.place.titlePicture.mediumSizeId, this.place.titlePicture.format);
    } else {
      this.titlePicSrc = "/assets/no-pic-place.png";
    }
  }

  private refreshSelectorsVisible() {
    this.isAccessibilityVisible = this.place && this.placesService.isAccessibilityApplicable(this.place.kind);
    this.isNearestAccessibilityVisible = this.isAccessibilityVisible && (this.place.accessibility) && (this.place.accessibility >= PlaceAccessibility.TRACTORONLY);
    this.isPopularityVisible = this.place && this.placesService.isPopularityApplicable(this.place.kind);
    this.isCapacityVisible = this.place && this.placesService.isCapacityApplicable(this.place.kind);
  }

  private refreshGalleryVisible() {
    this.isGalleryVisible = (this.place) && (this.place.gallery) && (this.isEditMode || (this.place.gallery.pictures.length > 0));
  }

  private refreshSelectTitlePicVisible() {
    if (this.isEditMode) {
      let galleryHasImage = this.place?.gallery && this.place.gallery.pictures.length > 0;
      this.isSelectTitlePicButtonVisible = galleryHasImage;
      this.isSelectTitlePicLabelVisible = !galleryHasImage;
    } else {
      this.isSelectTitlePicButtonVisible = false;
      this.isSelectTitlePicLabelVisible = false;
    }
  }

  private refreshXBApprovalCheckboxVisible() {
    // Open for admins only: only on client, just for fun.
    this.isXBApprovalCheckboxVisible = this.isEditMode && this.authService.user && this.authService.user.isAdmin;
  }

  private updateMapRef() {
    if (this.place) {
      this.mapRef = createGoogleRefFromLocation(this.place.location);
    } else {
      this.mapRef = null;
    }
  }
}
