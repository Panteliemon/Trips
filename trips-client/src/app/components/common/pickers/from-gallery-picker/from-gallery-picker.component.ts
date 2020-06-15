import { Component, OnInit } from '@angular/core';
import { Gallery } from 'src/app/models/gallery';
import { Picture } from 'src/app/models/picture';
import { getPictureUrl } from 'src/app/stringUtils';
import { PopupsService } from 'src/app/services/popups.service';

@Component({
  selector: 'app-from-gallery-picker',
  templateUrl: './from-gallery-picker.component.html',
  styleUrls: ['./from-gallery-picker.component.css']
})
export class FromGalleryPickerComponent implements OnInit {
  // Access through PopupsService.
  // Call open() when needed.

  isVisible: boolean = false;

  allPictures: Picture[];
  selectedPicture: Picture;

  selectionCallback: (value: Picture) => void;

  constructor(private popupsService: PopupsService) { }

  open(source: Gallery[], selectedItemSmallSizeId: string, onSelected: (value: Picture) => void) {
    this.allPictures = [];
    for (let gallery of source) {
      if (gallery) {
        for (let picture of gallery.pictures) {
          this.allPictures.push(picture);
        }
      }
    }

    this.selectedPicture = null;
    if (selectedItemSmallSizeId) {
      // it returns undefined, and I want null
      let foundPicture = this.allPictures.find(p => p.smallSizeId == selectedItemSmallSizeId);
      if (foundPicture) {
        this.selectedPicture = foundPicture;
      }
    }

    this.selectionCallback = onSelected;
    this.isVisible = true;
  }

  ngOnInit(): void {
    this.popupsService.registerFromGalleryPicker(this);
  }

  getPictureUrl = getPictureUrl;

  onClick(picture: Picture) {
    this.selectedPicture = picture;
  }

  onSelectClicked() {
    this.isVisible = false;
    // Clear trash
    this.allPictures.length = 0;

    if (this.selectionCallback) {
      this.selectionCallback(this.selectedPicture);
    }

    this.selectedPicture = null;
  }

  onCancelClicked() {
    this.isVisible = false;
    // Clear trash
    this.allPictures.length = 0;
    this.selectedPicture = null;
  }
}
