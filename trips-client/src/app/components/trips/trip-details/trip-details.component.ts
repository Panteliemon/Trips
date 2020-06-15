import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripsService } from 'src/app/services/trips.service';
import { MessageService, MessageButtons, MessageIcon, MessageResult } from 'src/app/services/message.service';
import { AuthService } from 'src/app/services/auth.service';
import { Trip } from 'src/app/models/trip';
import { getPictureUrl, dateToInputString, inputStringToDate, possibleStringToDate } from 'src/app/stringUtils';
import { UserHeader } from 'src/app/models/user-header';
import { Observable } from 'rxjs';
import { PlaceHeader } from 'src/app/models/place-header';
import { PlacesService } from 'src/app/services/places.service';
import { Visit } from 'src/app/models/visit';
import { PopupsService } from 'src/app/services/popups.service';
import { Gallery } from 'src/app/models/gallery';

// Additional data for visit
class VisitData {
  visitId: number;
  selectedPictureSmallSizeId: string;
}

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.less']
})
export class TripDetailsComponent implements OnInit {
  tripId: number;
  trip: Trip;
  isNotFound: boolean;
  isEditMode: boolean;
  
  isOverallLoaderVisible: boolean;
  isEditButtonVisible: boolean;
  isEndEditButtonVisible: boolean;
  isDeleteButtonVisible: boolean;

  isSelectTitlePicButtonVisible: boolean;
  isResetTitlePicButtonVisible: boolean;
  isSelectTitlePicAdviceVisible: boolean;

  tripName: string;
  tripDate: string;
  titlePicSrc: string;

  isTripGalleryVisible: boolean;

  tripGallerySelectedPicture: string;

  private _isDateProcessing: boolean;
  private _visitsData: VisitData[];

  constructor(private route: ActivatedRoute, private router: Router,
              private tripsService: TripsService,
              private messageService: MessageService,
              private authService: AuthService,
              private popupsService: PopupsService,
              private placesService: PlacesService) { }

  ngOnInit(): void {
    this.tripId = +this.route.snapshot.paramMap.get("id");
    this.isOverallLoaderVisible = true;
    this.tripsService.getTrip(this.tripId).subscribe(t => {
      this.isOverallLoaderVisible = false;
      this.setTrip(t);

      if (this.route.snapshot.paramMap.get("edit") == "true") {
        if (this.authService.user?.canPublishTrips) {
          this.setEditMode(true);
        } else {
          this.setEditMode(false);
          this.messageService.showMessage("У вас нет прав на редактирование");
        }
      } else {
        this.setEditMode(false);
      }
    }, error => {
      this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
      this.isOverallLoaderVisible = false;
    });
  }

  editButtonClicked() {
    if ((!this.isEditMode) && (this.authService.user?.canPublishTrips)) {
      this.setEditMode(true);
      this.renavigateWithParams();
    }
  }

  endEditButtonClicked() {
    if (this.isEditMode) {
      this.setEditMode(false);
      this.renavigateWithParams();
    }
  }

  async deleteButtonClicked() {
    let answer = await this.messageService.showMessage(`Удалить поездку ${this.tripName}?`, MessageButtons.yesNo, MessageIcon.question).toPromise();
    if (answer == MessageResult.yes) {
      // Check for pictures
      let hasAnyPictures = this.hasAnyPictures();
      if (hasAnyPictures) {
        answer = await this.messageService.showMessage("Данная поездка содержит картинки. Они все будут удалены при удалении поездки. Так, и что. Строго говоря, вы должны понимать, что удолизм у нас не поощряется.\r\nУдалить поездку?", MessageButtons.yesNo, MessageIcon.warning).toPromise();
      }

      if (answer == MessageResult.yes) {
        try {
          this.isOverallLoaderVisible = true;
          await this.tripsService.deleteTrip(this.tripId).toPromise();
          this.isOverallLoaderVisible = false;

          this.router.navigate(["/trips"]);
          this.messageService.showMessage("УДОЛИЛ!!1", MessageButtons.ok,
                                          hasAnyPictures ? MessageIcon.prokhanization : MessageIcon.info);
        } catch (error) {
          this.isOverallLoaderVisible = false;
          this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
        }
      }
    }
  }

  setTitlePicButtonClicked() {
    if (this.hasAnyPictures()) {
      let concatGalleries: Gallery[] = [];
      if (this.trip.visits) { // always should be true
        concatGalleries = this.trip.visits.filter(v => v.gallery).map(v => v.gallery);
      }
      if (this.trip.gallery) { // always should be true
        concatGalleries.push(this.trip.gallery);
      }

      this.popupsService.fromGalleryPicker.open(concatGalleries, this.trip?.titlePicture?.smallSizeId, pic => {
        this.trip.titlePicture = pic;
        this.refreshTitlePicSrc();
        this.refreshTitlePicButtonsVisible();
        this.silentUpdate();
      });
    }
  }

  resetTitlePicButtonClicked() {
    if (this.trip.titlePicture) {
      this.messageService.showMessage("Сбросить картинку?", MessageButtons.yesNo, MessageIcon.question).subscribe(result => {
        if (result == MessageResult.yes) {
          this.trip.titlePicture = null;
          this.refreshTitlePicSrc();
          this.refreshTitlePicButtonsVisible();
          this.silentUpdate();
        }
      });
    }
  }

  async setDate(value: string) {
    // When value changed by enter and messagebox appears, we immediately receive blur event,
    // so messagebox appears second time. Use this workaroud to prevent:
    if (!this._isDateProcessing) {
      this._isDateProcessing = true;

      let dValue = inputStringToDate(value);
      if (dValue && this.trip.addedDate && (dValue > possibleStringToDate(this.trip.addedDate))) {
        await this.messageService.showMessage("Поездка не может состояться позже, чем добавлена сюда.").toPromise();
      } else if (dValue && (dValue > (new Date()))) {
        await this.messageService.showMessage("Дата больше чем сегодня").toPromise();
      } else if (dValue && (dValue < new Date(2014, 7, 8))) { // I guess that 8 Aug 2014
        await this.messageService.showMessage("Введенная дата - это слишком давно. Введите плз что-либо из периода эпохи поездочек.").toPromise();
      } else {
        this.trip.date = dValue;
        this.refreshTripDate();
        this.silentUpdate();
      }

      this._isDateProcessing = true;
    }
  }

  setTitle(value: string) {
    this.trip.title = value;
    this.refreshTripName();
    this.silentUpdate();
  }

  autoSetTitleClicked() {
    this.trip.title = this.getDefaultTitle();
    this.refreshTripName();
    this.silentUpdate();
  }

  userAdded(user: UserHeader) {
    this.performSilentUpdate(this.tripsService.addParticipant(this.trip.id, user.id));
  }

  userRemoved(user: UserHeader) {
    this.performSilentUpdate(this.tripsService.removeParticipant(this.trip.id, user.id));
  }

  setDescription(value: string) {
    this.trip.description = value;
    this.silentUpdate();
  }

  getPlaceName(place: PlaceHeader): string {
    if (place) {
      return this.placesService.getDisplayablePlaceName(place.name);
    } else {
      return "[ДАННЫЕ УДАЛЕНЫ]";
    }
  }

  getPlacePicture(place: PlaceHeader): string {
    return this.placesService.getMiniaturePicSrc(place);
  }

  changeVisitPlaceButtonClicked(visit: Visit) {
    this.popupsService.placePicker.open("Выберите место", place => {
      visit.place = place;
      this.silentUpdate(visit);
    });
  }

  async deleteVisitButtonClicked(visit: Visit) {
    let placeName = this.getPlaceName(visit.place);
    let answer = await this.messageService.showMessage(`Удалить место ${placeName} из поездки?`, MessageButtons.yesNo, MessageIcon.question).toPromise();
    if (answer == MessageResult.yes) {
      let withPictures: boolean = false;
      if (visit.gallery?.pictures && (visit.gallery.pictures.length > 0)) {
        answer = await this.messageService.showMessage(`Визит данного места содержит картинки. Они все будут удалены, если вы удалите визит. Так, и что.\r\nУдалить место ${placeName} из поездки?`, MessageButtons.yesNo, MessageIcon.warning).toPromise();
        withPictures = true;
      }

      if (answer == MessageResult.yes) {
        this.isOverallLoaderVisible = true;
        try {
          await this.tripsService.removeVisit(this.tripId, visit.id).toPromise();
          // Reread all
          let trip = await this.tripsService.getTrip(this.tripId).toPromise();
          this.setTrip(trip);

          this.isOverallLoaderVisible = false;

          if (withPictures) {
            this.messageService.showMessage("[ДАННЫЕ УДАЛЕНЫ]");
          }
        } catch (error) {
          this.isOverallLoaderVisible = false;
          this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
        }
      }
    }
  }

  setVisitWithKebab(visit: Visit, value: boolean) {
    visit.withKebab = value;
    this.silentUpdate(visit);
  }

  setVisitWithNightStay(visit: Visit, value: boolean) {
    visit.withNightStay = value;
    this.silentUpdate(visit);
  }

  isVisitGalleryVisible(visit: Visit): boolean {
    return this.isEditMode || (visit?.gallery?.pictures && visit.gallery.pictures.length > 0);
  }

  async visitGalleryFileSelected(visit: Visit, file: File) {
    this.isOverallLoaderVisible = true;
    try {
      let uploadedPic = await this.tripsService.uploadVisitPicture(this.trip.id, visit.id, file).toPromise();
      
      // Gallery selection only works if there is corresponding object in collection,
      // so temporarily add. We're going to reread all anyway.
      visit.gallery.pictures.push(uploadedPic);
      this.setVisitGallerySelectedPicture(visit, uploadedPic.smallSizeId);

      // Reread all
      let trip = await this.tripsService.getTrip(this.tripId).toPromise();
      this.setTrip(trip);

      // Auto set title pic
      if (!this.trip.titlePicture) {
        this.trip.titlePicture = uploadedPic;
        this.refreshTitlePicSrc();
        this.refreshTitlePicButtonsVisible();
        this.silentUpdate(); // don't wait till the end
      }

      this.isOverallLoaderVisible = false;
    } catch (error) {
      this.isOverallLoaderVisible = false;
      this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok,
                                      this.tripsService.getServerErrorIcon(error));
    }
  }

  visitGalleryUpdateRequested(visit: Visit) {
    this.silentUpdate(visit, true);
  }

  async visitGalleryDeleteConfirmed(visit: Visit, pictureIndex: number) {
    if (visit?.gallery?.pictures && (pictureIndex >= 0) && (pictureIndex < visit.gallery.pictures.length)) {
      this.isOverallLoaderVisible = true;
      try {
        let deletedPictureSmallSizeId = visit.gallery.pictures[pictureIndex].smallSizeId;
        await this.tripsService.deleteVisitPicture(this.trip.id, visit.id, deletedPictureSmallSizeId).toPromise();
        
        // Set new selected picture
        visit.gallery.pictures.splice(pictureIndex, 1);
        if (pictureIndex < visit.gallery.pictures.length) {
          this.setVisitGallerySelectedPicture(visit, visit.gallery.pictures[pictureIndex].smallSizeId);
        } else {
          if (visit.gallery.pictures.length > 0) {
            this.setVisitGallerySelectedPicture(visit, visit.gallery.pictures[visit.gallery.pictures.length - 1].smallSizeId);
          } else {
            this.setVisitGallerySelectedPicture(visit, "");
          }
        }

        // Reread all
        let trip = await this.tripsService.getTrip(this.tripId).toPromise();
        this.setTrip(trip);

        this.isOverallLoaderVisible = false;
      } catch (error) {
        this.isOverallLoaderVisible = false;
        this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
      }
    }
  }

  getVisitGallerySelectedPicture(visit: Visit): string {
    let vData = this._visitsData.find(vd => vd.visitId == visit.id);
    return (vData) ? vData.selectedPictureSmallSizeId : null;
  }

  setVisitGallerySelectedPicture(visit: Visit, value: string) {
    let vData = this._visitsData.find(vd => vd.visitId == visit.id);
    if (vData) {
      vData.selectedPictureSmallSizeId = value;
    }
  }

  addVisitButtonClicked() {
    this.popupsService.placePicker.open("Выберите место", async place => {
      this.isOverallLoaderVisible = true;
      try {
        await this.tripsService.addVisit(this.tripId, place.id).toPromise();
        // Reread all
        let trip = await this.tripsService.getTrip(this.tripId).toPromise();
        this.setTrip(trip);

        this.isOverallLoaderVisible = false;
      } catch (error) {
        this.isOverallLoaderVisible = false;
        this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
      }
    });
  }

  async tripGalleryFileSelected(file: File) {
    this.isOverallLoaderVisible = true;
    try {
      let uploadedPic = await this.tripsService.uploadPicture(this.tripId, file).toPromise();
      
      // Gallery selection only works if there is corresponding object in collection,
      // so temporarily add. We're going to reread all anyway.
      this.trip.gallery.pictures.push(uploadedPic);
      this.tripGallerySelectedPicture = uploadedPic.smallSizeId;

      // Reread all
      let trip = await this.tripsService.getTrip(this.tripId).toPromise();
      this.setTrip(trip);

      // Auto set title pic
      if (!this.trip.titlePicture) {
        this.trip.titlePicture = uploadedPic;
        this.refreshTitlePicSrc();
        this.refreshTitlePicButtonsVisible()
        this.silentUpdate(); // don't wait till the end
      }

      this.isOverallLoaderVisible = false;
    } catch (error) {
      this.isOverallLoaderVisible = false;
      this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok,
                                      this.tripsService.getServerErrorIcon(error));
    }
  }

  tripGalleryUpdateRequested() {
    this.silentUpdate(null, false, true);
  }

  async tripGalleryDeleteConfirmed(index: number) {
    if (this.trip?.gallery?.pictures && (index >= 0) && (index < this.trip.gallery.pictures.length)) {
      this.isOverallLoaderVisible = true;
      try {
        let deletedPictureSmallSizeId = this.trip.gallery.pictures[index].smallSizeId;
        await this.tripsService.deletePicture(this.tripId, deletedPictureSmallSizeId).toPromise();
        
        // Set new selected picture
        this.trip.gallery.pictures.splice(index, 1);
        if (index < this.trip.gallery.pictures.length) {
          this.tripGallerySelectedPicture = this.trip.gallery.pictures[index].smallSizeId;
        } else {
          if (this.trip.gallery.pictures.length > 0) {
            this.tripGallerySelectedPicture = this.trip.gallery.pictures[this.trip.gallery.pictures.length - 1].smallSizeId;
          } else {
            this.tripGallerySelectedPicture = "";
          }
        }

        // Reread all
        let trip = await this.tripsService.getTrip(this.tripId).toPromise();
        this.setTrip(trip);

        this.isOverallLoaderVisible = false;
      } catch (error) {
        this.isOverallLoaderVisible = false;
        this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
      }
    }
  }

  private setTrip(value: Trip) {
    this.trip = value;
    if (this.trip) {
      this.isNotFound = false;

      this.refreshTripName();
      this.refreshTripDate();
      this.refreshTitlePicSrc();
      this.refreshTripGalleyVisible();
      this.refreshVisitsData();
      this.refreshTitlePicButtonsVisible();

      // All this code just to avoid angular's "expression has changed after checked" error.
      // For our business logic nothing wrong happens is gallery component changes its selected image immediately.
      if (!this.tripGallerySelectedPicture) {
        if (this.trip.gallery?.pictures && (this.trip.gallery.pictures.length > 0)) {
          this.tripGallerySelectedPicture = this.trip.gallery.pictures[0].smallSizeId;
        } else {
          this.tripGallerySelectedPicture = "";
        }
      }
    } else {
      this.isNotFound = true;
    }
  }

  private refreshTripName() {
    this.tripName = this.tripsService.getDisplayableTripTitle(this.trip);
  }

  private refreshTripDate() {
    this.tripDate = dateToInputString(this.trip.date);
  }

  private refreshTitlePicSrc() {
    if (this.trip?.titlePicture) {
      this.titlePicSrc = getPictureUrl(this.trip.titlePicture.mediumSizeId, this.trip.titlePicture.format);
    } else {
      this.titlePicSrc = "/assets/no-pic-trip.png";
    }
  }

  private refreshTripGalleyVisible() {
    this.isTripGalleryVisible = this.isEditMode || (this.trip.gallery?.pictures && (this.trip.gallery.pictures.length > 0))
  }

  private refreshVisitsData() {
    if (this.trip?.visits) {
      if (this._visitsData) {
        let newData: VisitData[] = [];
        for (let visit of this.trip.visits) {
          let vData = this._visitsData.find(vd => vd.visitId == visit.id);
          if (vData) {
            newData.push(vData);
          } else {
            newData.push({ visitId: visit.id, selectedPictureSmallSizeId: visit.gallery?.pictures[0]?.smallSizeId || "" });
          }
        }

        this._visitsData = newData;
      } else {
        this._visitsData = this.trip.visits.map(v => {
          return { visitId: v.id, selectedPictureSmallSizeId: v.gallery?.pictures[0]?.smallSizeId || "" };
        });
      }
    }
  }

  private refreshTitlePicButtonsVisible() {
    if (this.isEditMode) {
      let hasAnyPictures = this.hasAnyPictures();
      this.isSelectTitlePicButtonVisible = hasAnyPictures;
      this.isSelectTitlePicAdviceVisible = !hasAnyPictures;

      this.isResetTitlePicButtonVisible = !!this.trip.titlePicture;
    } else {
      this.isSelectTitlePicButtonVisible = false;
      this.isResetTitlePicButtonVisible = false;
      this.isSelectTitlePicAdviceVisible = false;
    }
  }

  private setEditMode(value: boolean) {
    this.isEditMode = value;
    if (value) {
      this.isEditButtonVisible = false;
      this.isEndEditButtonVisible = true;
      this.isDeleteButtonVisible = true;
    } else {
      this.isEditButtonVisible = this.authService.user?.canPublishTrips;
      this.isEndEditButtonVisible = false;
      this.isDeleteButtonVisible = false;
    }

    this.refreshTripGalleyVisible();
    this.refreshTitlePicButtonsVisible();
  }

  private renavigateWithParams() {
    let parametersObj = <any>{};
    if (this.isEditMode) {
      parametersObj.edit = "true";
    }

    this.router.navigate([`/trip/${this.tripId}`, parametersObj])
  }

  private getDefaultTitle(): string {
    return this.trip.visits.map(v => v.place.name).join(" - ");
  }

  private hasAnyPictures(): boolean {
    let result: boolean = (this.trip.gallery?.pictures && (this.trip.gallery.pictures.length > 0));
    if (!result) {
      result = !!(this.trip.visits && this.trip.visits.find(v => v.gallery?.pictures && (v.gallery?.pictures.length > 0)));
    }

    return result;
  }

  private performSilentUpdate(updateAction: Observable<any>) {
    updateAction.subscribe(() => { }, error => {
      this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }

  // We all know server supports partial update, so:
  // - Pass visit if you want update this visit's fields as well. Otherwise only fields of Trip are passed to server.
  // - Specify withVisitGallery=true if you want to update visit's gallery as well (reordering pictures, picture descriptions).
  //   If false, only trip's and visit's own fields are passed to the server.
  // - Specify withOwnGallery=true if you want to update trip's gallery as well.
  private silentUpdate(visitToUpdate: Visit = null, withVisitGallery: boolean = false, withOwnGallery: boolean  = false) {
    let shallowCopy: Trip = Object.assign({}, this.trip);
    shallowCopy.participants = null; // this is ignored by server in any case

    if (visitToUpdate) {
      // We trust caller that visitToUpdate always belongs to the current trip, so don't check.
      let visitShallowCopy: Visit = Object.assign({}, visitToUpdate);
      if (!withVisitGallery) {
        visitShallowCopy.gallery = null;
      }

      shallowCopy.visits = [];
      shallowCopy.visits.push(visitShallowCopy);
    } else {
      shallowCopy.visits = null;
    }

    if (!withOwnGallery) {
      shallowCopy.gallery = null;
    }

    this.performSilentUpdate(this.tripsService.updateTrip(shallowCopy));
  }
}
