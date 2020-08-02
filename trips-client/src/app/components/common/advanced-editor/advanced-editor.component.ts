import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { PopupsService } from 'src/app/services/popups.service';
import { TripsService } from 'src/app/services/trips.service';
import { PlacesService } from 'src/app/services/places.service';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { getStandardColor, getPictureUrl } from 'src/app/stringUtils';
import { Gallery } from 'src/app/models/gallery';

class Selection {
  start: number;
  end: number;
}

@Component({
  selector: 'app-advanced-editor',
  templateUrl: './advanced-editor.component.html',
  styleUrls: ['./advanced-editor.component.css']
})
export class AdvancedEditorComponent implements OnInit, OnChanges {
  @Input()
  text: string = "";
  @Input()
  isEditable: boolean = true;
  @Input()
  galleries: Gallery[];

  @Output()
  update = new EventEmitter<string>();

  @ViewChild("tbMain")
  tbMain: ElementRef;

  warnings: string[] = [];

  constructor(private popupsService: PopupsService, private tripsService: TripsService,
              private placesService: PlacesService, private vehiclesService: VehiclesService) { }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  warningsChanged(value: string[]) {
    this.warnings = value;
  }

  bClick() {
    let selection = this.getSelection();
    if (selection) {
      this.ensureTextNotNull();
      if (selection.start == selection.end) {
        this.text = this.text.substring(0, selection.start) + "[b][/b]" + this.text.substring(selection.end);
      } else {
        this.text = this.text.substring(0, selection.start) + "[b]" + this.text.substring(selection.start, selection.end) + "[/b]" + this.text.substring(selection.end);
      }

      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + 3, selection.end + 3);
    }
  }

  iClick() {
    let selection = this.getSelection();
    if (selection) {
      this.ensureTextNotNull();
      if (selection.start == selection.end) {
        this.text = this.text.substring(0, selection.start) + "[i][/i]" + this.text.substring(selection.end);
      } else {
        this.text = this.text.substring(0, selection.start) + "[i]" + this.text.substring(selection.start, selection.end) + "[/i]" + this.text.substring(selection.end);
      }

      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + 3, selection.end + 3);
    }
  }

  uClick() {
    let selection = this.getSelection();
    if (selection) {
      this.ensureTextNotNull();
      if (selection.start == selection.end) {
        this.text = this.text.substring(0, selection.start) + "[u][/u]" + this.text.substring(selection.end);
      } else {
        this.text = this.text.substring(0, selection.start) + "[u]" + this.text.substring(selection.start, selection.end) + "[/u]" + this.text.substring(selection.end);
      }

      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + 3, selection.end + 3);
    }
  }

  sClick() {
    let selection = this.getSelection();
    if (selection) {
      this.ensureTextNotNull();
      if (selection.start == selection.end) {
        this.text = this.text.substring(0, selection.start) + "[s][/s]" + this.text.substring(selection.end);
      } else {
        this.text = this.text.substring(0, selection.start) + "[s]" + this.text.substring(selection.start, selection.end) + "[/s]" + this.text.substring(selection.end);
      }

      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + 3, selection.end + 3);
    }
  }

  colorChange(value: string) {
    let selection = this.getSelection();
    if (selection) {
      let standardColorName = getStandardColor(value);
      let openTag = (standardColorName) ? `[color=${standardColorName}]` : `[color=${value}]`;
      
      this.ensureTextNotNull();
      if (selection.start == selection.end) {
        this.text = this.text.substring(0, selection.start) + openTag + "[/color]" + this.text.substring(selection.end);
      } else {
        this.text = this.text.substring(0, selection.start) + openTag + this.text.substring(selection.start, selection.end) + "[/color]" + this.text.substring(selection.end);
      }

      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + openTag.length, selection.end + openTag.length);
    }
  }

  sizeClick() {
    let selection = this.getSelection();
    if (selection) {
      this.ensureTextNotNull();
      if (selection.start == selection.end) {
        this.text = this.text.substring(0, selection.start) + "[size=12][/size]" + this.text.substring(selection.end);
      } else {
        this.text = this.text.substring(0, selection.start) + "[size=12]" + this.text.substring(selection.start, selection.end) + "[/size]" + this.text.substring(selection.end);
      }

      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start+6, selection.start+8);
    }
  }

  h1Click() {
    let selection = this.getSelection();
    if (selection) {
      this.ensureTextNotNull();
      if (selection.start == selection.end) {
        this.text = this.text.substring(0, selection.start) + "[h1][/h1]" + this.text.substring(selection.end);
      } else {
        this.text = this.text.substring(0, selection.start) + "[h1]" + this.text.substring(selection.start, selection.end) + "[/h1]" + this.text.substring(selection.end);
      }

      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + 4, selection.end + 4);
    }
  }

  h2Click() {
    let selection = this.getSelection();
    if (selection) {
      this.ensureTextNotNull();
      if (selection.start == selection.end) {
        this.text = this.text.substring(0, selection.start) + "[h2][/h2]" + this.text.substring(selection.end);
      } else {
        this.text = this.text.substring(0, selection.start) + "[h2]" + this.text.substring(selection.start, selection.end) + "[/h2]" + this.text.substring(selection.end);
      }

      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + 4, selection.end + 4);
    }
  }

  h3Click() {
    let selection = this.getSelection();
    if (selection) {
      this.ensureTextNotNull();
      if (selection.start == selection.end) {
        this.text = this.text.substring(0, selection.start) + "[h3][/h3]" + this.text.substring(selection.end);
      } else {
        this.text = this.text.substring(0, selection.start) + "[h3]" + this.text.substring(selection.start, selection.end) + "[/h3]" + this.text.substring(selection.end);
      }

      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + 4, selection.end + 4);
    }
  }

  galleryPictureClick() {
    let selection = this.getSelection();
    if (selection && this.galleries) {
      this.popupsService.fromGalleryPicker.open(this.galleries, null, (picture) => {
        let insertedText = `[img]${getPictureUrl(picture.mediumSizeId, picture.format)}[/img]`;
        if (picture.largeSizeId != picture.mediumSizeId) {
          insertedText = `[url=${getPictureUrl(picture.largeSizeId, picture.format)}]${insertedText}[/url]`;
        }

        this.ensureTextNotNull();
        this.text = this.text.substring(0, selection.start) + insertedText + this.text.substring(selection.start);
        this.update.emit(this.text);
        this.selectAndFocusWithDelay(selection.start + insertedText.length, selection.start + insertedText.length);
      });
    }
  }

  linkClick() {
    let selection = this.getSelection();
    if (selection) {
      this.ensureTextNotNull();
      const exampleUrl: string = "https://poezdo4ki.azurewebsites.net";
      if (selection.start == selection.end) {
        this.text = this.text.substring(0, selection.start) + "[url=" + exampleUrl + "]ссылка[/url]" + this.text.substring(selection.end);
      } else {
        this.text = this.text.substring(0, selection.start) + "[url=" + exampleUrl + "]" + this.text.substring(selection.start, selection.end) + "[/url]" + this.text.substring(selection.end);
      }

      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + 5, selection.start + 5 + exampleUrl.length);
    }
  }

  tripClick() {
    this.popupsService.tripPicker.open("Выберите поездку", trip => {
      let selection = this.getSelection();
      if (selection) { // Usually always not null
        let openTag = `[url=/trip/${trip.id}]`;
        let middle = (selection.start == selection.end) ? this.tripsService.getDisplayableTripTitle(trip) : this.text.substring(selection.start, selection.end);
        this.ensureTextNotNull();
        this.text = this.text.substring(0, selection.start) + openTag + middle + "[/url]" + this.text.substring(selection.end);
        this.update.emit(this.text);
        this.selectAndFocusWithDelay(selection.start + openTag.length, selection.start + openTag.length + middle.length);
      }
    });
  }

  placeClick() {
    this.popupsService.placePicker.open("Выберите место", place => {
      let selection = this.getSelection();
      if (selection) { // Usually always not null
        let openTag = `[url=/place/${place.id}]`;
        let middle = (selection.start == selection.end) ? this.placesService.getDisplayablePlaceName(place.name) : this.text.substring(selection.start, selection.end);
        this.ensureTextNotNull();
        this.text = this.text.substring(0, selection.start) + openTag + middle + "[/url]" + this.text.substring(selection.end);
        this.update.emit(this.text);
        this.selectAndFocusWithDelay(selection.start + openTag.length, selection.start + openTag.length + middle.length);
      }
    });
  }

  vehicleClick() {
    this.popupsService.vehiclePicker.show("Выберите транспортное средство", vehicle => {
      let selection = this.getSelection();
      if (selection) { // Usually always not null
        let openTag = `[url=/vehicle/${vehicle.id}]`;
        let middle = (selection.start == selection.end) ? this.vehiclesService.getDisplayableVehicleName(vehicle) : this.text.substring(selection.start, selection.end);
        this.ensureTextNotNull();
        this.text = this.text.substring(0, selection.start) + openTag + middle + "[/url]" + this.text.substring(selection.end);
        this.update.emit(this.text);
        this.selectAndFocusWithDelay(selection.start + openTag.length, selection.start + openTag.length + middle.length);
      }
    });
  }

  userClick() {
    this.popupsService.userPicker.show("Выберите пользователя", user => {
      let selection = this.getSelection();
      if (selection) { // Usually always not null
        let openTag = `[url=/user/${user.id}]`;
        let middle = (selection.start == selection.end) ? user.name : this.text.substring(selection.start, selection.end);
        this.ensureTextNotNull();
        this.text = this.text.substring(0, selection.start) + openTag + middle + "[/url]" + this.text.substring(selection.end);
        this.update.emit(this.text);
        this.selectAndFocusWithDelay(selection.start + openTag.length, selection.start + openTag.length + middle.length);
      }
    });
  }

  placeKindClick(value: number) {
    let selection = this.getSelection();
    if (selection) {
      let strValue = (value == null) ? "N/A" : value.toString();
      let insertedText = `[placekind]${strValue}[/placekind]`;
      this.ensureTextNotNull();
      this.text = this.text.substring(0, selection.start) + insertedText + this.text.substring(selection.start);
      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + insertedText.length, selection.start + insertedText.length);
    }
  }

  placeAccessClick(value: number) {
    let selection = this.getSelection();
    if (selection) {
      let strValue = (value == null) ? "N/A" : value.toString();
      let insertedText = `[placeaccess]${strValue}[/placeaccess]`;
      this.ensureTextNotNull();
      this.text = this.text.substring(0, selection.start) + insertedText + this.text.substring(selection.start);
      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + insertedText.length, selection.start + insertedText.length);
    }
  }

  placePopClick(value: number) {
    let selection = this.getSelection();
    if (selection) {
      let strValue = (value == null) ? "N/A" : value.toString();
      let insertedText = `[placepop]${strValue}[/placepop]`;
      this.ensureTextNotNull();
      this.text = this.text.substring(0, selection.start) + insertedText + this.text.substring(selection.start);
      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + insertedText.length, selection.start + insertedText.length);
    }
  }

  placeCapacityClick(value: number) {
    let selection = this.getSelection();
    if (selection) {
      let strValue = (value == null) ? "N/A" : value.toString();
      let insertedText = `[placecapacity]${strValue}[/placecapacity]`;
      this.ensureTextNotNull();
      this.text = this.text.substring(0, selection.start) + insertedText + this.text.substring(selection.start);
      this.update.emit(this.text);
      this.selectAndFocusWithDelay(selection.start + insertedText.length, selection.start + insertedText.length);
    }
  }

  textAreaBlur() {
    this.update.emit(this.text);
  }

  // Gets current selection from the DOM and makes sure everything is valid
  private getSelection(): Selection {
    if ((this.tbMain?.nativeElement)
          && (this.tbMain.nativeElement.selectionStart !== undefined)
          && (this.tbMain.nativeElement.selectionEnd !== undefined)) {
      let start: number = this.tbMain.nativeElement.selectionStart;
      let end: number = this.tbMain.nativeElement.selectionEnd;
      let textLength = this.text?.length ?? 0;
      if ((start >= 0) && (start <= textLength)
          && (end >= 0) && (end <= textLength)) {
        let result = new Selection();    
        if (start > end) { // Never observed this, but the specification says it's acceptable
          result.start = end;
          result.end = start;
        } else {
          result.start = start;
          result.end = end;
        }

        return result;
      }
    }

    return null;
  }

  private ensureTextNotNull() {
    if (this.text == null) {
      this.text = "";
    }
  }

  private selectAndFocusWithDelay(selectionStart: number, selectionEnd: number) {
    setTimeout(() => {
      this.selectAndFocus(selectionStart, selectionEnd);
    }, 100);
  }

  private selectAndFocus(selectionStart: number, selectionEnd: number) {
    if ((this.tbMain?.nativeElement)
          && (this.tbMain.nativeElement.selectionStart !== undefined)
          && (this.tbMain.nativeElement.selectionEnd !== undefined)
          && (this.text != null)
          && (selectionStart >= 0) && (selectionStart <= this.text.length)
          && (selectionEnd >= 0) && (selectionEnd <= this.text.length)) {
      if (selectionStart <= selectionEnd) {
        this.tbMain.nativeElement.selectionStart = selectionStart;
        this.tbMain.nativeElement.selectionEnd = selectionEnd;
      } else {
        // Should never happen
        this.tbMain.nativeElement.selectionStart = selectionEnd;
        this.tbMain.nativeElement.selectionEnd = selectionStart;
      }

      this.tbMain.nativeElement.focus();
    }
  }
}
