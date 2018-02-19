import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'datawhore-segment',
  templateUrl: './segment.component.html',
  styleUrls: ['./segment.component.less']
})
export class SegmentComponent implements OnInit {

  @Input() public segment;
  public items;

  constructor() { }

  ngOnInit() {
    console.log(this.segment);

    const activities = !this.segment.space && !! this.segment[this.segment.type] ? this.segment[this.segment.type].activities : [];
    const drops = !!this.segment[this.segment.type] ? this.segment[this.segment.type].drops : [];
    this.items = !!drops ? activities.concat(drops) : activities;

  }

}
