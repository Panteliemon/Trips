import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { Gallery } from 'src/app/models/gallery';
import { Picture } from 'src/app/models/picture';
import { MessageService, MessageIcon, MessageButtons, MessageResult } from 'src/app/services/message.service';
import { getPictureUrl } from 'src/app/stringUtils';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.less']
})
export class GalleryComponent implements OnInit, OnChanges {
  @Input()
  gallery: Gallery;

  @Input()
  isEditable: boolean;

  @Output()
  fileSelected = new EventEmitter<File>();

  @Output()
  // Happens when needs to update gallery data: pictures reordered or description changed
  updateRequested = new EventEmitter();

  @Output()
  deleteConfirmed = new EventEmitter<number>();

  @Input()
  selectedImageSmallSizeId: string;
  @Output()
  selectedImageSmallSizeIdChange = new EventEmitter<string>();

  selectedImage: Picture;
  selectedImageIndex: number = -1;

  canGoBack: boolean;
  canGoNext: boolean;
  canMoveForward: boolean;
  canMoveBackward: boolean;

  constructor(private messageService: MessageService) { }
 
  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedImageSmallSizeId"]) {
      this.selectImageBySmallSizeId(this.selectedImageSmallSizeId);
    }

    if (changes["gallery"]) {
      if (this.gallery) {
        // Try to select previously selected
        this.selectImageBySmallSizeId(this.selectedImageSmallSizeId);
      } else {
        // Reset selected picture model, but don't reset its key,
        // so if reset to null and then set the same gallery, selection remains.
        this.selectedImage = null;
      }
    }
  }

  onFileSelected(files: File[]) {
    // If no files selected - ignore
    if (files.length > 0) {
      if (files.length > 1) {
        this.messageService.showMessage("Только один файл!", MessageButtons.ok, MessageIcon.warning);
      } else {
        let f = files[0];
        if (f.size > 16*1024*1024) {
          this.messageService.showMessage("Слишком большой файл. Максимальный размер: 16 МБ", MessageButtons.ok, MessageIcon.warning);
        } else {
          if (!this.isSupportedFileType(f.type)) {
            this.messageService.showMessage("Файл не поддерживается. Нужны картинки формата JPEG, PNG или BMP.", MessageButtons.ok, MessageIcon.warning);
          } else {
            // Verified. Pass to the owner who knows how and where to upload
            this.fileSelected.emit(f);
          }
        }
      }
    }
  }

  onMiniatureSelected(smallSizeId: string) {
    this.selectImageBySmallSizeId(smallSizeId);
  }

  goBackClicked() {
    this.selectImageByIndex(this.selectedImageIndex - 1);
  }

  goNextClicked() {
    this.selectImageByIndex(this.selectedImageIndex + 1);
  }

  moveForwardClicked() {
    if (this.canMoveForward) {
      let nextPic = this.gallery.pictures[this.selectedImageIndex + 1];
      this.gallery.pictures[this.selectedImageIndex + 1] = this.gallery.pictures[this.selectedImageIndex];
      this.gallery.pictures[this.selectedImageIndex] = nextPic;
      this.selectedImageIndex++;
      this.refreshButtonsAccessibility();
      this.updateRequested.emit();
    }
  }

  moveBackwardClicked() {
    if (this.canMoveBackward) {
      let prevPic = this.gallery.pictures[this.selectedImageIndex - 1];
      this.gallery.pictures[this.selectedImageIndex - 1] = this.gallery.pictures[this.selectedImageIndex];
      this.gallery.pictures[this.selectedImageIndex] = prevPic;
      this.selectedImageIndex--;
      this.refreshButtonsAccessibility();
      this.updateRequested.emit();
    }
  }

  deleteClicked() {
    if (this.selectedImageIndex >= 0)
    {
      this.messageService.showMessage("Удалить текущее изображение?", MessageButtons.yesNo, MessageIcon.warning).subscribe(result => {
        if (result == MessageResult.yes) {
          this.deleteConfirmed.emit(this.selectedImageIndex);
        }
      });
    }
  }

  getPictureUrl = getPictureUrl;

  setDescription(value: string) {
    if (this.selectedImage) {
      this.selectedImage.description = value;
      this.updateRequested.emit();
    }
  }

  private selectImageBySmallSizeId(newSmallSizeId: string) {
    if (newSmallSizeId) {
      let index = this.gallery.pictures.findIndex(pic => pic.smallSizeId == newSmallSizeId);
      if (index >= 0) {
        this.selectImageByIndex(index);
      } else {
        // Select the first / none if none
        this.selectImageByIndex(0);
      }
    } else {
      // Select the first
      this.selectImageByIndex(0);
    }
  }

  // Fundamental selection procedure: sets all
  private selectImageByIndex(index: number) {
    if (this.gallery) {
      if (index < 0) {
        this.selectedImage = null;
        this.selectedImageIndex = -1;
        // Keep selectedImageSmallSizeId
      } else if (index >= this.gallery.pictures.length) {
        // Select last
        if (this.gallery.pictures.length > 0) {
          this.selectedImage = this.gallery.pictures[this.gallery.pictures.length - 1];
          this.selectedImageIndex = this.gallery.pictures.length - 1;
          this.setSelectedImageSmallSizeId(this.gallery.pictures[this.gallery.pictures.length - 1].smallSizeId);
        } else {
          this.selectedImage = null;
          this.selectedImageIndex = -1;
          // Keep selectedImageSmallSizeId
        }
      } else {
        // Normal index
        this.selectedImage = this.gallery.pictures[index];
        this.selectedImageIndex = index;
        this.setSelectedImageSmallSizeId(this.gallery.pictures[index].smallSizeId);
      }
    } else {
      this.selectedImage = null;
      this.selectedImageIndex = -1;
      // Keep selectedImageSmallSizeId
    }

    this.refreshButtonsAccessibility();
  }

  private setSelectedImageSmallSizeId(newValue: string) {
    let hasChanged = this.selectedImageSmallSizeId != newValue;
    this.selectedImageSmallSizeId = newValue;
    if (hasChanged) {
      this.selectedImageSmallSizeIdChange.emit(this.selectedImageSmallSizeId);
    }
  }

  private refreshButtonsAccessibility() {
    this.canGoBack = this.selectedImageIndex > 0;
    this.canGoNext = (this.selectedImageIndex >= 0) && (this.gallery) && (this.selectedImageIndex + 1 < this.gallery.pictures.length);
    this.canMoveBackward = this.canGoBack;
    this.canMoveForward = this.canGoNext;
  }

  private isSupportedFileType(fileType: string): boolean {
    return (fileType == "image/jpeg") || (fileType == "image/png") || (fileType == "image/bmp");
  }
}
