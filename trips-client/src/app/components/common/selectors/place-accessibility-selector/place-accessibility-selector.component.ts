import { Component, OnInit, Input, Output, SimpleChanges, EventEmitter, OnChanges } from '@angular/core';
import { ChoiceViewModel, SEL_WHITE, SEL_GRAY, SEL_NOT_SELECTED, SEL_DARKGREEN, SEL_LIGHTGREEN, SEL_YELLOW, SEL_ORANGE, SEL_RED } from '../selector-engine/selector-engine.component';
import { PlaceAccessibility } from 'src/app/models/place';

let placeAccessibilityViewModels: ChoiceViewModel[] = [
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
    associatedValue: PlaceAccessibility.ASPHALTGRAVEL,
    bigText: "1",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    description: "Асфальт/гравейка",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_DARKGREEN,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceAccessibility.DIRTROADFLAT,
    bigText: "2",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    description: "Ровная лесная/полевая дорога",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_LIGHTGREEN,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceAccessibility.DEEPTRACKSPUDDLES,
    bigText: "3",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    description: "Большие лужи/Глубокая колея",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_YELLOW,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceAccessibility.TRACTORONLY,
    bigText: "4",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    description: "Жопа/Только на тракторе",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_ORANGE,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceAccessibility.NOROAD,
    bigText: "5",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    description: "Нет дороги",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_RED,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  }
];

@Component({
  selector: 'app-place-accessibility-selector',
  templateUrl: './place-accessibility-selector.component.html',
  styleUrls: ['./place-accessibility-selector.component.css']
})
export class PlaceAccessibilitySelectorComponent implements OnInit, OnChanges {
  @Input()
  value: PlaceAccessibility;

  @Output()
  valueChange = new EventEmitter<PlaceAccessibility>();

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
      this.viewModels = placeAccessibilityViewModels;
    }
  }
}
