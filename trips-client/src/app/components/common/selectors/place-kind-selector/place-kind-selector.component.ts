import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { PlaceKind } from 'src/app/models/place';
import { ChoiceViewModel, SEL_GRAY, SEL_NOT_SELECTED, SEL_WHITE, SEL_BLUE, SEL_BLACK, SEL_ORANGE } from '../selector-engine/selector-engine.component';

let placeSelectorViewModels: ChoiceViewModel[] = [
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
    associatedValue: PlaceKind.LAKE,
    bigText: "О",
    smallText: "Озеро",
    showBigText: true,
    showSmallText: true,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_BLUE,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceKind.DAM,
    bigText: "В",
    smallText: "Водохранилище",
    showBigText: true,
    showSmallText: true,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_BLUE,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceKind.RIVER,
    bigText: "Р",
    smallText: "Река",
    showBigText: true,
    showSmallText: true,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_BLUE,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceKind.TOWN,
    bigText: "Г",
    smallText: "Город",
    showBigText: true,
    showSmallText: true,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_BLACK,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceKind.RUINS,
    bigText: "Р",
    smallText: "Руины",
    showBigText: true,
    showSmallText: true,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_ORANGE,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  }
];

@Component({
  selector: 'app-place-kind-selector',
  templateUrl: './place-kind-selector.component.html',
  styleUrls: ['./place-kind-selector.component.css']
})
export class PlaceKindSelectorComponent implements OnInit, OnChanges {
  @Input()
  value: PlaceKind;

  @Output()
  valueChange = new EventEmitter<PlaceKind>();

  @Input()
  isEditable: boolean = true;

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
      this.viewModels = placeSelectorViewModels;
    }
  }
}
