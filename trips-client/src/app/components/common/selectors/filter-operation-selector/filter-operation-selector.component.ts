import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FilterOperation } from 'src/app/models/filter-operation';
import { ChoiceViewModel, SEL_WHITE, SEL_THEME_DARK, SEL_NOT_SELECTED } from '../selector-engine/selector-engine.component';

let filterOperationViewModels: ChoiceViewModel[] = [
  {
    associatedValue: FilterOperation.OR,
    bigText: "",
    smallText: "OR",
    showBigText: false,
    showSmallText: true,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_THEME_DARK,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: FilterOperation.AND,
    bigText: "",
    smallText: "AND",
    showBigText: false,
    showSmallText: true,
    description: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_THEME_DARK,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  }
];

@Component({
  selector: 'app-filter-operation-selector',
  templateUrl: './filter-operation-selector.component.html',
  styleUrls: ['./filter-operation-selector.component.css']
})
export class FilterOperationSelectorComponent implements OnInit, OnChanges {
  @Input()
  value: FilterOperation;
  @Output()
  valueChange = new EventEmitter<FilterOperation>();

  @Input()
  orCaption: string;
  @Input()
  andCaption: string;

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

    if (changes["orCaption"] || changes["andCaption"]) {
      this.initViewModels();
      let orVm = this.viewModels.find(vm => vm.associatedValue == FilterOperation.OR);
      if (orVm) { // always True
        orVm.smallText = this.orCaption;
      }
      let andVm = this.viewModels.find(vm => vm.associatedValue == FilterOperation.AND);
      if (andVm) { // always True
        andVm.smallText = this.andCaption;
      }
    }
  }

  private initViewModels() {
    if (!this.viewModels) {
      this.viewModels = filterOperationViewModels.map(vm => <ChoiceViewModel>Object.assign({}, vm));
    }
  }
}
