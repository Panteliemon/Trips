import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.less']
})
export class ProgressBarComponent implements OnInit, OnChanges {
  @Input()
  total: number = 0;
  @Input()
  done: number = 0;

  widthStr: string;
  progressValue:string;

  constructor() { }

  ngOnInit(): void {
    this.refresh();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes["total"]) || (changes["done"])) {
      this.refresh();
    }
  }

  private refresh() {
    if ((this.total >= this.done) && (this.total > 0)) {
      this.widthStr = Math.round(this.done / this.total * 100.0) + '%';
      this.progressValue = Math.round(this.done / this.total * 100.0) + '%';
    } else {
      if ((this.total == 0) && (this.done == 0)) {
        this.widthStr = "0%";
        this.progressValue = "...";
      } else {
        this.widthStr = "100%";
        if (this.total < this.done) {
          this.progressValue = this.done.toString();
        } else {
          this.progressValue = "100%";
        }
      }
    }
  }
}
