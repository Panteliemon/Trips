import { Component, OnInit } from '@angular/core';
import { PlacesService } from 'src/app/services/places.service';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { PlaceHeader } from 'src/app/models/place-header';

class PlaceWithStats {
  place: PlaceHeader;
  rating: number; // "place" :) (god...) of the place
  value: number;
}

@Component({
  selector: 'app-places-stats',
  templateUrl: './places-stats.component.html',
  styleUrls: ['./places-stats.component.less']
})
export class PlacesStatsComponent implements OnInit {
  isLoading: boolean;

  mostVisited: PlaceWithStats[];
  mostNightStay: PlaceWithStats[];

  constructor(private placesService: PlacesService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.placesService.getPlacesStats().subscribe(result => {
      this.isLoading = false;

      // It was grouped on server, now need to ungroup back
      this.mostVisited = [];
      for (let i=0; i<result.mostVisited.length; i++) {
        for (let j=0; j<result.mostVisited[i].places.length; j++) {
          // Don't include 1's if they are not in first 3 places
          if ((i <= 2) || (result.mostVisited[i].metric > 1)) {
            this.mostVisited.push({
              place: result.mostVisited[i].places[j],
              rating: i + 1,
              value: result.mostVisited[i].metric
            });
          }
        }
      }

      this.mostNightStay = [];
      for (let i=0; i<result.mostNightStay.length; i++) {
        for (let j=0; j<result.mostNightStay[i].places.length; j++) {
          // Don't include 1's if they are not in first 3 places
          if ((i <= 2) || (result.mostNightStay[i].metric > 1)) { 
            this.mostNightStay.push({
              place: result.mostNightStay[i].places[j],
              rating: i + 1,
              value: result.mostNightStay[i].metric
            });
          }
        }
      }
    }, error => {
      this.isLoading = false;
      this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
    })
  }

  getPlacePicSrc(place: PlaceHeader) {
    return this.placesService.getMiniaturePicSrc(place);
  }

  getPlaceName(place: PlaceHeader) {
    return this.placesService.getDisplayablePlaceName(place?.name);
  }
}
