import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'datawhore-image-figure',
  templateUrl: './image-figure.component.html',
  styleUrls: ['./image-figure.component.less']
})
export class ImageFigureComponent implements OnInit {

  public aspect: string;
  @Input() classes: string;
  @Input() size: string;
  @Input() specs: any;
  @Input() src: string;

  constructor() { }

  ngOnInit() {
    this.getAspect();
  }

  public getAspect(): any {

    if (!!this.specs) {

      const w = this.specs.width;
      const h = this.specs.height;
      const r = this.gcd(w, h);

      this.aspect = 'square';

      if (w / r < h / r) {
        this.aspect = 'long';
      }

      // console.log('Dimensions = ', w, ' x ', h, '<br>');
      // console.log('Gcd        = ', r, '<br>');
      // console.log('Aspect     = ', w / r, ':', h / r);

    }
  }

  public gcd(a, b): any {
    return (b === 0) ? a : this.gcd(b, a % b);
  }

}
