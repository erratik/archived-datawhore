import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'datawhore-json-viewer',
  template: '<t-json-viewer [json]="asset"></t-json-viewer>',
  styleUrls: ['./json-viewer.component.less']
})
export class JsonViewerComponent implements OnInit {

  @Input() public asset: any;
  constructor() { }

  ngOnInit() {
    // this.asset = {};
  }

}
