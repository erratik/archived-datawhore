import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'datawhore-segment',
  templateUrl: './segment.component.html',
  styleUrls: ['./segment.component.less']
})
export class SegmentComponent implements OnInit {

  @Input() public segment;
  
  constructor() { }

  ngOnInit() {
  }

}
