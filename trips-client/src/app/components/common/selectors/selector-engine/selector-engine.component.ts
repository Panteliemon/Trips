import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export class ChoiceViewModel {
  associatedValue: any;
  bigText: string;
  smallText: string;
  showBigText: boolean;
  showSmallText: boolean;
  iconSrc: string;
  description: string;
  // Appearance
  colorWhenSelected: string;
  colorWhenNotSelected: string;
  backgroundColorWhenSelected: string;
  backgroundColorWhenNotSelected: string;
}

// Background colors
export const SEL_NOT_SELECTED = "#bbb";
export const SEL_GRAY = "#888";
export const SEL_BLUE = "#08f";
export const SEL_DARKGREEN = "#082";
export const SEL_LIGHTGREEN = "#2f0";
export const SEL_YELLOW = "#fd0";
export const SEL_ORANGE = "#f80";
export const SEL_RED = "#f00";
// Foreground colors
export const SEL_WHITE = "#fff";
export const SEL_BLACK = "#000";

@Component({
  selector: 'app-selector-engine',
  templateUrl: './selector-engine.component.html',
  styleUrls: ['./selector-engine.component.css']
})
export class SelectorEngineComponent implements OnInit, OnChanges {
  @Input()
  choices: ChoiceViewModel[];

  @Input()
  selectedValue: ChoiceViewModel;
  @Output()
  selectedValueChange = new EventEmitter<ChoiceViewModel>();

  @Input()
  isEditable: boolean = true;

  availableChoices: ChoiceViewModel[];

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isEditable"]) {
      if (this.isEditable) {
        this.availableChoices = this.choices;
      } else {
        this.availableChoices = [this.selectedValue];
      }
    }
  }

  selectOption(option: ChoiceViewModel) {
    if (this.isEditable) {
      this.selectedValue = option;
      this.selectedValueChange.emit(option);
    }
  }
}
