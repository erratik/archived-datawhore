import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'space-icon',
  templateUrl: './space-icon.component.html',
  styleUrls: ['./space-icon.component.less']
})
export class SpaceIconComponent implements OnInit {

  @Input() classes: string;
  @Input() size = 16;
  @Input() space: string;
  public src: string;

  constructor() {
  }

  ngOnInit() {
    this.src = `http://datawhore.erratik.ca:10010/public/uploads/${this.space}/space/${this.space}-icon.png`;
  }

}
