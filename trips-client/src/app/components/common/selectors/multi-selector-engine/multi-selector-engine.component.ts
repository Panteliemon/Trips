import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export class ChoiceViewModel {
  associatedValue: any;
  bigText: string;
  smallText: string;
  tooltip: string;
  // Appearance
  colorWhenSelected: string;
  colorWhenNotSelected: string;
  backgroundColorWhenSelected: string;
  backgroundColorWhenNotSelected: string;
}

class InnerChoiceViewModel {
  choice: ChoiceViewModel;
  isSelected: boolean;
}

@Component({
  selector: 'app-multi-selector-engine',
  templateUrl: './multi-selector-engine.component.html',
  styleUrls: ['./multi-selector-engine.component.less']
})
export class MultiSelectorEngineComponent implements OnInit, OnChanges {
  @Input()
  choices: ChoiceViewModel[];

  @Input()
  selectedValues: any[];
  @Output()
  selectedValuesChange = new EventEmitter<any[]>();

  @Input()
  isEditable: boolean = true;

  innerChoices: InnerChoiceViewModel[];
  
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    let rebuildViewModelsNeeded = false;
    let refreshSelectedNeeded = false;
    
    if (changes["choices"]) {
      rebuildViewModelsNeeded = true;
    }

    if (changes["selectedValues"]) {
      refreshSelectedNeeded = true;
    }

    if (rebuildViewModelsNeeded) {
      this.innerChoices = this.choices.map(vm => <InnerChoiceViewModel>{
        choice: vm,
        isSelected: false
      });

      this.refreshSelectedFromSource();
    } else if (refreshSelectedNeeded) {
      this.refreshSelectedFromSource();
    }
  }

  onOptionClick(option: InnerChoiceViewModel) {
    if (this.isEditable) {
      option.isSelected = !option.isSelected;

      this.selectedValues = this.innerChoices.filter(vm => vm.isSelected).map(vm => vm.choice.associatedValue);
      this.selectedValuesChange.emit(this.selectedValues);
    }
  }

  private refreshSelectedFromSource() {
    for (let vm of this.innerChoices) {
      vm.isSelected = (this.selectedValues.findIndex(item => item == vm.choice.associatedValue) >= 0); // don't use "find" for easier work with nulls
    }
  }
}
