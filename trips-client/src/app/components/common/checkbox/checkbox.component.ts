import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.less']
})
export class CheckboxComponent implements OnInit {
  @Input()
  value: boolean;
  @Output()
  valueChange = new EventEmitter<boolean>();

  @Input()
  isEnabled: boolean = true;
  @Input()
  isEditable: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

  onClicked() {
    if (this.isEnabled && this.isEditable) {
      this.value = !this.value;
      this.valueChange.emit(this.value);
    }
  }
}
