import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'datawhore-image-figure',
  templateUrl: './image-figure.component.html',
  styleUrls: ['./image-figure.component.less']
})
export class ImageFigureComponent implements OnInit {

  @Input() size: string;
  @Input() src: string;
  @Input() classes: string;
  @Input() specs: any;
  protected aspect: string;

  constructor() { }

  ngOnInit() {
    if (!!this.specs) {

        const w = this.specs.width;
        const h = this.specs.height;
        const r = this.gcd (w, h);

        this.aspect = 'square';
        
        if (w / r < h / r) {
          this.aspect = 'long';
        }

        // console.log ('Dimensions = ', w, ' x ', h, '<br>');
        // console.log ('Gcd        = ', r, '<br>');
        // console.log ('Aspect     = ', w / r, ':', h / r);

    }
  }

  private gcd (a, b): any {
      return (b === 0) ? a : this.gcd (b, a % b);
  }

}
