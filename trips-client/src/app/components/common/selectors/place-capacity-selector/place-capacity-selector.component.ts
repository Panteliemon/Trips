import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PlaceCapacity } from 'src/app/models/place';
import { ChoiceViewModel, SEL_WHITE, SEL_GRAY, SEL_NOT_SELECTED, SEL_RED, SEL_LIGHTGREEN, SEL_DARKGREEN, SEL_ORANGE } from '../selector-engine/selector-engine.component';

let placeCapacityViewModels: ChoiceViewModel[] = [
  {
    associatedValue: null,
    bigText: "N/A",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_GRAY,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceCapacity.ZERO,
    bigText: "0",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    description: "Нет",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_RED,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceCapacity.SINGLE,
    bigText: "1",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_ORANGE,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceCapacity.SEVERAL,
    bigText: "2-3",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_LIGHTGREEN,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceCapacity.NUMEROUS,
    bigText: "N",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    description: "Более 3",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_DARKGREEN,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  }
];

@Component({
  selector: 'app-place-capacity-selector',
  templateUrl: './place-capacity-selector.component.html',
  styleUrls: ['./place-capacity-selector.component.css']
})
export class PlaceCapacitySelectorComponent implements OnInit, OnChanges {
  @Input()
  value: PlaceCapacity;

  @Output()
  valueChange = new EventEmitter<PlaceCapacity>();

  @Input()
  isEditable: boolean = true;

  @Input()
  isShortView: boolean = false;

  viewModels: ChoiceViewModel[];

  private _selectedViewModel: ChoiceViewModel;
  get selectedViewModel(): ChoiceViewModel {
    return this._selectedViewModel;
  }
  set selectedViewModel(value: ChoiceViewModel) {
    this._selectedViewModel = value;
    this.value = value.associatedValue;
    this.valueChange.emit(value.associatedValue);
  }

  constructor() { }

  ngOnInit(): void {
    this.initViewModels();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["value"]) {
      this.initViewModels();
      let index = this.viewModels.findIndex(vm => vm.associatedValue == this.value);
      if (index >= 0) {
        // Don't set via public property: public property is for setting from UI
        this._selectedViewModel = this.viewModels[index];
      } else {
        this._selectedViewModel = this.viewModels[0];
      }
    }
  }

  private initViewModels() {
    if (!this.viewModels) {
      this.viewModels = placeCapacityViewModels;
    }
  }
}
