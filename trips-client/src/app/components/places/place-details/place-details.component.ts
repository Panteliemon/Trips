import { Component, OnInit, ViewChild } from '@angular/core';
import { Place, PlaceKind, PlaceAccessibility, PlacePopularity, PlaceCapacity } from 'src/app/models/place';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from 'src/app/services/places.service';
import { MessageService, MessageButtons, MessageIcon, MessageResult } from 'src/app/services/message.service';
import { GalleryComponent } from '../../common/gallery/gallery.component';
import { AuthService } from 'src/app/services/auth.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { API_BASE_PATH } from 'src/app/services/api';

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

  isNearestAccessibilityVisible: boolean;

  @ViewChild('gallery')
  galleryView: GalleryComponent;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private placesService: PlacesService,
    private messageService: MessageService,
    private authService: AuthService) { }

  get placeKind(): PlaceKind {
    return this.place.kind;
  }
  set placeKind(value: PlaceKind) {
    this.place.kind = value;
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
    this.refreshNearestAccessibilityVisible();
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
      }
      this.refreshTitlePicSrc();
      this.refreshNearestAccessibilityVisible();
      this.isOverallLoaderVisible = false;
    }, error => {
      this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
      // Nothing is visible. Display empty page.
      this.isOverallLoaderVisible = false;
    });
  }

  onEditClicked() {
    this.isEditMode = true;
  }

  onEndEditClicked() {
    this.isEditMode = false;
  }

  onDeleteClicked() {
    // Gather some statistics before ask
    this.isOverallLoaderVisible = true;
    this.placesService.getVisitsForPlace(this.place.id, 1, 0).subscribe(async result => {
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
          let result2 = await this.messageService.showMessage("Удалить все упоминания данного места из поездочек? (Да - удалить (соотв. галереи тоже будут удалены), Нет - галереи и данные останутся, но имя места пропадёт, Отмена - передумал вообще удалять место (рекомендуемый вариант))",
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

  onGalleryAddFile(file: File) {
    this.isOverallLoaderVisible = true;
    this.placesService.uploadPicture(this.place.id, file).subscribe(pic => {
      // We will not reread the place, just append recieved image entry to the end of the gallery
      this.place.gallery.pictures.push(pic);
      this.galleryView.selectImageByIndex(this.place.gallery.pictures.length-1);
      this.isOverallLoaderVisible = false;
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

  onGalleryReordered() {
    this.initiateFullSilentUpdate();
  }

  onGalleryDeleteConfirmed(index: number) {
    let deletedPicture = this.place.gallery.pictures[index];
    this.isOverallLoaderVisible = true;
    this.placesService.deletePicture(this.place.id, deletedPicture.smallSizeId).subscribe(() => {
      this.isOverallLoaderVisible = false;
      this.place.gallery.pictures.splice(index, 1);
      this.galleryView.selectImageByIndex(index);
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
      this.titlePicSrc = API_BASE_PATH + "/pics/" + this.place.titlePicture.mediumSizeId;
    } else {
      this.titlePicSrc = "/assets/no-pic-place.png";
    }
  }

  private refreshNearestAccessibilityVisible() {
    this.isNearestAccessibilityVisible = (this.place) && (this.place.accessibility) && (this.place.accessibility >= PlaceAccessibility.TRACTORONLY);
  }
}
