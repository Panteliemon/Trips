import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-expander',
  templateUrl: './expander.component.html',
  styleUrls: ['./expander.component.css']
})
export class ExpanderComponent implements OnInit {
  @Input()
  title: string;

  @Input()
  isExpanded: boolean = false;
  @Output()
  isExpandedChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  expandButtonClicked() {
    this.isExpanded = !this.isExpanded;
    this.isExpandedChange.emit(this.isExpanded);
  }
}
