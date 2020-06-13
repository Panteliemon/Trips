import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripsService } from 'src/app/services/trips.service';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { AuthService } from 'src/app/services/auth.service';
import { Trip } from 'src/app/models/trip';
import { getPictureUrl } from 'src/app/stringUtils';
import { UserHeader } from 'src/app/models/user-header';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.css']
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

  tripName: string;
  titlePicSrc: string;

  constructor(private route: ActivatedRoute, private router: Router,
              private tripsService: TripsService,
              private messageService: MessageService,
              private authService: AuthService) { }

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

  deleteButtonClicked() {

  }

  userAdded(user: UserHeader) {
    this.performSilentUpdate(this.tripsService.addParticipant(this.trip.id, user.id));
  }

  userRemoved(user: UserHeader) {
    this.performSilentUpdate(this.tripsService.removeParticipant(this.trip.id, user.id));
  }

  private setTrip(value: Trip) {
    this.trip = value;
    if (this.trip) {
      this.isNotFound = false;

      this.tripName = this.tripsService.getDisplayableTripTitle(this.trip);
      this.refreshTitlePicSrc();

    } else {
      this.isNotFound = true;
    }
  }

  private refreshTitlePicSrc() {
    if (this.trip?.titlePicture) {
      this.titlePicSrc = getPictureUrl(this.trip.titlePicture.mediumSizeId, this.trip.titlePicture.format);
    } else {
      this.titlePicSrc = "/assets/no-pic-trip.png";
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
  }

  private renavigateWithParams() {
    let parametersObj = <any>{};
    if (this.isEditMode) {
      parametersObj.edit = "true";
    }

    this.router.navigate([`/trip/${this.tripId}`, parametersObj])
  }

  private performSilentUpdate(updateAction: Observable<any>) {
    updateAction.subscribe(() => { }, error => {
      this.messageService.showMessage(this.tripsService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    });
  }
}
