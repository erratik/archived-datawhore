import { SpacesService } from '../../../services/spaces.service';
import { RainService } from '../../../services/rain/rain.service';
import { Space } from '../../../models/space.model';
import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'datawhore-drops',
  templateUrl: './drops.component.html',
  styleUrls: ['./drops.component.less']
})
export class DropsComponent implements OnInit {

  @Input() public space: Space;
  protected drops;
  protected dropTypes;
  protected isLoading = false;
  public getDrops$: Observable<any> = new Observable<any>();
  public moreDrops$: Observable<any> = new Observable<any>();

  constructor(private rainService: RainService, private spacesService: SpacesService) { }

  ngOnInit() {

    this.dropTypes = this.rainService.rainSchemas.map(rain => rain.type);

    this.getDrops$ = this.rainService.getDrops(this.space.name, { limit: 3 }).do((drops) => {
      this.drops = _.groupBy(drops, 'type');
      console.log(this.drops);
    });

    this.getDrops$.subscribe();
  }

  private getMoreDrops(type: string): any {
    this.isLoading = !this.isLoading;
    // debugger;
    const after = _.minBy(this.drops[type], (o) => o['content']['date'])['content']['date'];

    this.moreDrops$ = this.rainService.getDrops(this.space.name, { limit: 3, type: type, after: after }).do((drops) => {
      this.drops = _.groupBy(drops, 'type');
    });


    this.moreDrops$.subscribe((newDrops) => {
      // debugger;
      this.rainService.sortDrops(newDrops, this.space.name);

      console.log(this.drops);
      // this.drops[type] = [...drops];
      this.isLoading = !this.isLoading;
    });
  }
  // private fetchNewDrops(type: string): any {
  //   this.isLoading = !this.isLoading;
  //   const dropSchema = this.rainService.rainSchemas.filter(rain => rain.type === type)[0];

  //   const data = {
  //     apiEndpointUrl: dropSchema.dropUrl,
  //     action: 'drops.fetch',
  //     contentPath: dropSchema.contentPath,
  //     type: type,
  //     space: this.space.name
  //   }

  //   const newDrops$ = this.spacesService.spaceEndpoint(this.space, data);

  //   newDrops$.subscribe((newDrops) => {
  //     const drops = this.rainService.sortDrops(newDrops, this.space.name);
  //     this.drops[type] = [...drops];
  //     this.isLoading = !this.isLoading;
  //   });
  // }


}
