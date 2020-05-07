import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ChoiceViewModel, SEL_NOT_SELECTED, SEL_GRAY, SEL_WHITE } from '../selector-engine/selector-engine.component';

let placesOrderingViewModels: ChoiceViewModel[] = [
  {
    associatedValue: "name",
    bigText: "",
    smallText: "По имени",
    showBigText: false,
    showSmallText: true,
    iconSrc: null,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_GRAY,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: "date",
    bigText: "",
    smallText: "По дате открытия",
    showBigText: false,
    showSmallText: true,
    iconSrc: null,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_GRAY,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  }
];

@Component({
  selector: 'app-places-ordering-selector',
  templateUrl: './places-ordering-selector.component.html',
  styleUrls: ['./places-ordering-selector.component.css']
})
export class PlacesOrderingSelectorComponent implements OnInit, OnChanges {
  @Input()
  value: string;

  @Output()
  valueChange = new EventEmitter<string>();

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
      this.viewModels = placesOrderingViewModels;
    }
  }
}
