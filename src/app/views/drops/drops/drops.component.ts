import { ActivatedRoute } from '@angular/router';
import { RainConfigsComponent } from '../../rain/rain-configs/rain-configs/rain-configs.component';
import { SpaceItemService } from '../../../shared/services/space-item/space-item.service';
import { SpacesService } from '../../../services/spaces.service';
import { RainService } from '../../../services/rain/rain.service';
import { Space } from '../../../models/space.model';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'datawhore-drops',
  templateUrl: './drops.component.html',
  styleUrls: ['./drops.component.less']
})
export class DropsComponent extends RainConfigsComponent implements OnInit, OnDestroy {

  @Input() public space: Space;
  public drops;
  public dropTypes;
  // public rainSchemas;
  public rain;
  public isLoading = false;
  public getDrops$: Observable<any> = new Observable<any>();
  public moreDrops$: Observable<any> = new Observable<any>();
  public deleteDrops$: Observable<any> = new Observable<any>();
  public activeTab;
  public model;

  public overrideRainName: any = {};

  constructor(spacesService: SpacesService,
  spaceItemService: SpaceItemService,
    activatedRoute: ActivatedRoute,
    rainService: RainService) {
      super(spacesService, spaceItemService, activatedRoute, rainService);
  }

  ngOnDestroy() {
    this.rainService.drops[this.space.name] = this.drops = null;
  }

  ngOnInit() {

    this.getRainSchemas$ = this.getRawRain()
    .switchMap(() => this.getRain());

    this.getRainSchemas$.subscribe(() => {
        this.activeTab = this.rainSchemas.length ? this.rainSchemas[0].type : this.activeTab;
        this.rainSchemas = this.rainService.rainSchemas;
        this.rain = this.rainService.rain;

        if (this.rainSchemas.length) {
            this.rainService.type = this.rainSchemas[0].type;
            this.rainService.rainSchemas = this.rainService.rainSchemas.map(rainSchema => {
                this.overrideRainName[rainSchema.type] = rainSchema.type;
                return rainSchema;
            });
            this.dropTypes = this.rainService.rainSchemas.map((rain, i) => rain.type);
            this.getSomeDrops(this.dropTypes[0]);
            // console.log(this.rainSchemas);
        }
    });
  }


//   private getRain(): any {
//     // debugger;
//     return this.rainService.getRain(this.space.name).do((rain) => {
//         // console.log(rain);
//     });
// }

//   private getRawRain(): any {
//       return this.spaceItemService.fetchSchema(this.space.name, 'rain').do((rain) => {
//           this.rainService.rainSchemas = rain.map(rainSchema => this.toSchema(rainSchema));
//           // this.getActiveTab();
//           // this.activeSubTab = 'config';
//       });
//   }

  private getSomeDrops(dropType = null): any {

    const options = { limit: 10, after: Date.now() };
    if (dropType) {
      options['type'] = dropType;
    }

    this.getDrops$ = this.rainService.getDrops(this.space.name, options).do((drops) => {
      this.drops = _.groupBy(drops, 'type');
      this.activeTab =  dropType;
    });

    this.getDrops$.subscribe();

  }

  private getMoreDrops(type: string): any {
    this.isLoading = !this.isLoading;
    const after = _.minBy(this.drops[type], (o) => o['timestamp'])['timestamp'];

    this.moreDrops$ = this.rainService.getDrops(this.space.name, { limit: 3, type: type, after: after }).do((drops) => {
      this.drops = _.groupBy(drops, 'type');
    });


    this.moreDrops$.subscribe((newDrops) => {
      this.isLoading = !this.isLoading;
    });
  }

  public setActiveTab(dropType: string): void {
    this.activeTab = this.rainService.type = dropType;
    this.rainService.drops[this.space.name] = null;
    this.getSomeDrops(dropType);

  }

  protected deleteDrop(drop): any {

    this.deleteDrops$ = this.rainService.deleteDrops([drop], this.space.name).do((drops) => {
      // this.drops = _.groupBy(drops, 'type');
      console.log(drops)
    debugger;
    });

    this.deleteDrops$.subscribe((newDrops) => {
      this.isLoading = !this.isLoading;
    });
  }


}
