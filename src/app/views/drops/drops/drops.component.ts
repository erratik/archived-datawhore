import { RainService } from '../../../services/rain/rain.service';
import { Space } from '../../../models/space.model';
import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'datawhore-drops',
  templateUrl: './drops.component.html',
  styleUrls: ['./drops.component.less']
})
export class DropsComponent implements OnInit {

  @Input() public space: Space;
  protected drops;

  constructor(private rainService: RainService) { }

  ngOnInit() {
    const $getDrops = this.rainService.getDrops(this.space.name)
                      .do((drops) => this.drops = drops);
    $getDrops.subscribe(() => {
      console.log(this.drops);

      this.drops = _.groupBy(this.drops, 'type');
    });
  }

  private fetchNewDrops(): any {
    // const url = this.rainService.rainSchemas.filter(rain => rain.type === drop.type)[0]
  }

}
