import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PlacePopularity } from 'src/app/models/place';
import { ChoiceViewModel, SEL_WHITE, SEL_GRAY, SEL_NOT_SELECTED, SEL_DARKGREEN, SEL_YELLOW, SEL_ORANGE, SEL_RED } from '../selector-engine/selector-engine.component';

let placePopularityViewModels: ChoiceViewModel[] = [
  {
    associatedValue: null,
    bigText: "N/A",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    iconSrc: null,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_GRAY,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlacePopularity.ALWAYSFREE,
    bigText: "1",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    iconSrc: null,
    description: "Всегда свободно",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_DARKGREEN,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlacePopularity.SOMETIMESOCCUPIED,
    bigText: "2",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    iconSrc: null,
    description: "Возможно, кто-то будет",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_YELLOW,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlacePopularity.MOSTPROBABLYOCCUPIED,
    bigText: "3",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    iconSrc: null,
    description: "Наиболее вероятно, что кто-то будет",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_ORANGE,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlacePopularity.CROWDED,
    bigText: "4",
    smallText: "",
    showBigText: true,
    showSmallText: false,
    iconSrc: null,
    description: "Толпы",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_RED,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  }
];

@Component({
  selector: 'app-place-popularity-selector',
  templateUrl: './place-popularity-selector.component.html',
  styleUrls: ['./place-popularity-selector.component.css']
})
export class PlacePopularitySelectorComponent implements OnInit, OnChanges {
  @Input()
  value: PlacePopularity;

  @Output()
  valueChange = new EventEmitter<PlacePopularity>();

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
      this.viewModels = placePopularityViewModels;
    }
  }
}
