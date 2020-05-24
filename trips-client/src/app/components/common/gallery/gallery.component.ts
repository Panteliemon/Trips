import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { Gallery } from 'src/app/models/gallery';
import { Picture } from 'src/app/models/picture';
import { API_BASE_PATH } from 'src/app/services/api';
import { MessageService, MessageIcon, MessageButtons, MessageResult } from 'src/app/services/message.service';

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
  reordered = new EventEmitter();

  @Output()
  deleteConfirmed = new EventEmitter<number>();

  selectedImage: Picture;
  selectedImageSmallSizeId: string;
  selectedImageIndex: number = -1;

  canGoBack: boolean;
  canGoNext: boolean;
  canMoveForward: boolean;
  canMoveBackward: boolean;

  constructor(private messageService: MessageService) { }
 
  public selectImageByIndex(index: number) {
    if (this.gallery) {
      if (index < 0) {
        this.selectedImage = null;
        this.selectedImageIndex = -1;
        // keep selectedImageSmallSizeId
      } else if (index >= this.gallery.pictures.length) {
        // Select last
        if (this.gallery.pictures.length > 0) {
          this.selectedImage = this.gallery.pictures[this.gallery.pictures.length - 1];
          this.selectedImageIndex = this.gallery.pictures.length - 1;
          this.selectedImageSmallSizeId = this.gallery.pictures[this.gallery.pictures.length - 1].smallSizeId;
        } else {
          this.selectedImage = null;
          this.selectedImageIndex = -1;
          // keep selectedImageSmallSizeId
        }
      } else {
        // Normal index
        this.selectedImage = this.gallery.pictures[index];
        this.selectedImageIndex = index;
        this.selectedImageSmallSizeId = this.gallery.pictures[index].smallSizeId;
      }
    } else {
      this.selectedImage = null;
      this.selectedImageIndex = -1;
      // keep selectedImageSmallSizeId
    }

    this.refreshButtonsAccessibility();
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["gallery"]) {
      if (this.gallery) {
        // Select previously selected or the first one
        this.selectImage(this.selectedImageSmallSizeId);
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
    this.selectImage(smallSizeId);
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
      this.reordered.emit();
    }
  }

  moveBackwardClicked() {
    if (this.canMoveBackward) {
      let prevPic = this.gallery.pictures[this.selectedImageIndex - 1];
      this.gallery.pictures[this.selectedImageIndex - 1] = this.gallery.pictures[this.selectedImageIndex];
      this.gallery.pictures[this.selectedImageIndex] = prevPic;
      this.selectedImageIndex--;
      this.refreshButtonsAccessibility();
      this.reordered.emit();
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

  getImageSrc(imageId: string): string {
    return API_BASE_PATH + "/pics/" + imageId;
  }

  private selectImage(smallSizeId: string) {
    if (smallSizeId) {
      let index = this.gallery.pictures.findIndex(pic => pic.smallSizeId == smallSizeId);
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
