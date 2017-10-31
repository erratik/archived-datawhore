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
  @Input() src: any;
  @Input() space: string;
  public thumbnail: string;

  constructor() {
    super()
  }

  ngOnInit() {

    this.getAspect();
    this.aspect += `-${this.space}`;
    this.thumbnail = this.getThumbnailUrl(this.src);
    console.log(this.thumbnail, this.aspect);

    if (!!this.type) {
      const linkedTypes = ['video', 'link'];
      this.link = linkedTypes.includes(this.type) ? this.link[1] : this.link[0];
    }
  }

  private getThumbnailUrl(thumbData): any {
    
    if (typeof thumbData !== 'string') {
      switch (this.space) {
        case 'swarm':
          thumbData = `${thumbData[0].prefix}64x88${thumbData[0].suffix}`;
          break;
        default:
          break;
      }

    }
    return thumbData;
  }

}
