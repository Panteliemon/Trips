import { Injectable } from '@angular/core';
import { FromGalleryPickerComponent } from '../components/common/pickers/from-gallery-picker/from-gallery-picker.component';
import { PlacePickerComponent } from '../components/common/pickers/place-picker/place-picker.component';
import { UserPickerComponent } from '../components/common/pickers/user-picker/user-picker.component';

@Injectable({
  providedIn: 'root'
})
export class PopupsService {
  private _fromGalleryPicker: FromGalleryPickerComponent;
  private _placePicker: PlacePickerComponent;
  private _userPicker: UserPickerComponent;

  constructor() { }

  get fromGalleryPicker(): FromGalleryPickerComponent { return this._fromGalleryPicker; }
  get placePicker(): PlacePickerComponent { return this._placePicker; }
  get userPicker(): UserPickerComponent { return this._userPicker; }

  registerFromGalleryPicker(component: FromGalleryPickerComponent) {
    if (!this._fromGalleryPicker) {
      this._fromGalleryPicker = component;
    }
  }

  registerPlacePicker(component: PlacePickerComponent) {
    if (!this._placePicker) {
      this._placePicker = component;
    }
  }

  registerUserPicker(component: UserPickerComponent) {
    if (!this._userPicker) {
      this._userPicker = component;
    }
  }
}
