import { Component, OnInit } from '@angular/core';
import { Place } from 'src/app/models/place';
import { ActivatedRoute } from '@angular/router';
import { PlacesService } from 'src/app/services/places.service';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';

@Component({
  selector: 'app-place-details',
  templateUrl: './place-details.component.html',
  styleUrls: ['./place-details.component.css']
})
export class PlaceDetailsComponent implements OnInit {
  place: Place;

  isOverallLoaderVisible: boolean;
  isNotFound: boolean;



  constructor(private route: ActivatedRoute,
    private placesService: PlacesService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    let placeId = +this.route.snapshot.paramMap.get("id");
    this.isOverallLoaderVisible = true;
    this.placesService.getPlace(placeId).subscribe(place => {
      this.place = place;
      if (!place) {
        this.isNotFound = true;
      }
      this.isOverallLoaderVisible = false;
    }, error => {
      this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
      // Nothing is visible. Display empty page.
      this.isOverallLoaderVisible = false;
    });
  }

  setPlaceName(value: string) {
    let changed = this.place.name != value;
    this.place.name = value;
    if (changed && (!value)) {
      this.messageService.showMessage("Всё же неплохо бы, чтобы имя не было пустым. Так будет легче найти данное место поиском, и т.д.", MessageButtons.ok, MessageIcon.info);
    }

    this.initiatePartialSilentUpdate();
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
}
