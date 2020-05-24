import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ChoiceViewModel } from '../multi-selector-engine/multi-selector-engine.component';
import { SEL_WHITE, SEL_GRAY, SEL_NOT_SELECTED, SEL_BLUE, SEL_BLACK, SEL_ORANGE } from '../selector-engine/selector-engine.component';
import { PlaceKind } from 'src/app/models/place';

let placeMultiSelectorViewModels: ChoiceViewModel[] = [
  {
    associatedValue: null,
    bigText: "N/A",
    smallText: "",
    tooltip: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_GRAY,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceKind.LAKE,
    bigText: "О",
    smallText: "Озеро",
    tooltip: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_BLUE,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceKind.DAM,
    bigText: "В",
    smallText: "Водохранилище",
    tooltip: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_BLUE,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceKind.RIVER,
    bigText: "Р",
    smallText: "Река",
    tooltip: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_BLUE,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceKind.TOWN,
    bigText: "Г",
    smallText: "Город",
    tooltip: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_BLACK,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  },
  {
    associatedValue: PlaceKind.RUINS,
    bigText: "Р",
    smallText: "Руины",
    tooltip: "",
    colorWhenSelected: SEL_WHITE,
    colorWhenNotSelected: SEL_WHITE,
    backgroundColorWhenSelected: SEL_ORANGE,
    backgroundColorWhenNotSelected: SEL_NOT_SELECTED
  }
];

@Component({
  selector: 'app-place-kind-multi-selector',
  templateUrl: './place-kind-multi-selector.component.html',
  styleUrls: ['./place-kind-multi-selector.component.css']
})
export class PlaceKindMultiSelectorComponent implements OnInit, OnChanges {
  @Input()
  selectedValues: PlaceKind[];
  @Output()
  selectedValuesChange = new EventEmitter<PlaceKind[]>();

  @Input()
  isEditable: boolean = true;
  
  viewModels: ChoiceViewModel[];

  constructor() { }

  ngOnInit(): void {
    this.initViewModels();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedValues"]) {
      this.initViewModels();
    }
  }

  onSelectedValuesChanged() {
    this.selectedValuesChange.emit(this.selectedValues);
  }

  private initViewModels() {
    if (!this.viewModels) {
      this.viewModels = placeMultiSelectorViewModels.map(vm => <ChoiceViewModel>Object.assign({}, vm));
    }
  }
}
