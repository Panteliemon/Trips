import { Component, OnInit } from '@angular/core';
import { Gallery } from 'src/app/models/gallery';
import { Picture } from 'src/app/models/picture';
import { API_BASE_PATH } from 'src/app/services/api';

@Component({
  selector: 'app-from-gallery-picker',
  templateUrl: './from-gallery-picker.component.html',
  styleUrls: ['./from-gallery-picker.component.css']
})
export class FromGalleryPickerComponent implements OnInit {

  // Usage: place in your component
  // Call open() when needed.

  isVisible: boolean = false;

  allPictures: Picture[];
  selectedPicture: Picture;

  selectionCallback: (value: Picture) => void;

  constructor() { }

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
  }

  getImageSrc(pictureId: string): string {
    return API_BASE_PATH + "/pics/" + pictureId;
  }

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