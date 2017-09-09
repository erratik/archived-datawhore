import { ImageFigureComponent } from '../image-figure/image-figure.component';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'datawhore-drop-image',
  templateUrl: './drop-image.component.html',
  styleUrls: ['./drop-image.component.less']
})
export class DropImageComponent extends ImageFigureComponent implements OnInit {

  @Input() type: string;
  @Input() link: any;

  constructor() {
    super()
  }

  ngOnInit() {
    const linkedTypes = ['video', 'link'];
    this.link = linkedTypes.includes(this.type) ? this.link[1] : this.link[0];
  }

}
