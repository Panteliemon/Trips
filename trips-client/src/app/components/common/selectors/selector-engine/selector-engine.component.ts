import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export class ChoiceViewModel {
  associatedValue: any;
  bigText: string;
  smallText: string;
  showBigText: boolean;
  showSmallText: boolean;
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
export const SEL_BLUE = "#06f";
export const SEL_DARKGREEN = "#072";
export const SEL_LIGHTGREEN = "#2d0";
export const SEL_YELLOW = "#fd0";
export const SEL_ORANGE = "#f80";
export const SEL_RED = "#f00";
// Foreground colors
export const SEL_WHITE = "#fff";
export const SEL_BLACK = "#000";

class InnerChoiceViewModel {
  choice: ChoiceViewModel;

  // Calculated values:
  isSelected: boolean;
  isSmallTextVisible: boolean;
  isDescriptionVisible: boolean;
  tooltip: string;
}

@Component({
  selector: 'app-selector-engine',
  templateUrl: './selector-engine.component.html',
  styleUrls: ['./selector-engine.component.less']
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
  @Input()
  isShortView: boolean = false;
  @Input()
  isTooltipToLeft: boolean = false;

  innerChoices: InnerChoiceViewModel[];
  showDescription: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    let refillNeeded = false;
    let recalculateNeeded = false;

    if (changes["choices"]) {
      refillNeeded = true;
    }

    if (changes["selectedValue"]) {
      recalculateNeeded = true;
    }

    if (changes["isEditable"]) {
      refillNeeded = true;
    }

    if (changes["isShortView"]) {
      recalculateNeeded = true;
    }

    if (refillNeeded) {
      if (this.isEditable) {
        this.innerChoices = this.choices.map(vm => this.createInnerViewModel(vm));
      } else {
        this.innerChoices = [this.createInnerViewModel(this.selectedValue)];
      }

      this.refreshCalculatedValues();
    } else if (recalculateNeeded) {
      this.refreshCalculatedValues();
    }
  }

  selectOption(option: ChoiceViewModel) {
    if (this.isEditable) {
      this.selectedValue = option;
      this.refreshCalculatedValues();

      this.selectedValueChange.emit(option);
    }
  }

  refreshCalculatedValues() {
    this.showDescription = !!((!this.isShortView) && (this.selectedValue) && (this.selectedValue.description));

    for (let i=0; i<this.innerChoices.length; i++) {
      let vm = this.innerChoices[i];
      vm.isSelected = (this.selectedValue == vm.choice);
      vm.isSmallTextVisible = !!((!this.isShortView) && vm.choice.showSmallText && vm.choice.smallText);
      
      // Tooltip
      if (vm.isSmallTextVisible) {
        if (vm.choice.description) {
          if (vm.isSelected) {
            // If both description and small text are presented - there is nothing new we can add from our side. No tooltip.
            vm.tooltip = this.showDescription ? "" : vm.choice.description;
          } else {
            // Description for item is hidden, so present it in tooltip
            vm.tooltip = vm.choice.description;
          }
        } else {
          // There is nothing we can add to display in tooltip
          vm.tooltip = "";
        }
      } else {
        if (vm.choice.smallText && vm.choice.showSmallText) {
          // SmallText is hidden due to ShortView mode. Display SmallText in the tooltip
          vm.tooltip = vm.choice.smallText;
        } else {
          if (vm.isSelected) {
            // Show description in the tooltip, but only if description is hidden. Otherwise - no tooltip.
            vm.tooltip = this.showDescription ? "" : vm.choice.description;
          } else {
            vm.tooltip = vm.choice.description; // if no description - no tooltip
          }
        }
      }
    }
  }

  private createInnerViewModel(vm: ChoiceViewModel): InnerChoiceViewModel {
    return {
      choice: vm,
      isSelected: false,
      isSmallTextVisible: false,
      isDescriptionVisible: false,
      tooltip: ""
    };
  }
}
