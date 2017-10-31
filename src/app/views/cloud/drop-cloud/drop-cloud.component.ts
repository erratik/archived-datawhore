import { ActivatedRoute } from '@angular/router';
import { RainConfigsComponent } from '../../rain/rain-configs/rain-configs/rain-configs.component';
import { SpaceItemService } from '../../../shared/services/space-item/space-item.service';
import { SpacesService } from '../../../services/spaces.service';
import { RainService } from '../../../services/rain/rain.service';
import { Space } from '../../../models/space.model';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { ProfileService } from "app/services/profile/profile.service";
import { OauthSettingsService } from "app/services/space/oauth-settings.service";

@Component({
  selector: 'datawhore-drop-cloud',
  templateUrl: './drop-cloud.component.html',
  styleUrls: ['./drop-cloud.component.less']
})
export class DropCloudComponent extends RainConfigsComponent implements OnInit, OnDestroy {


  @Input() public space: Space;
  public drops;
  public dropTypes;
  public rain;
  public isLoading = false;
  public getCloudDrops$: Observable<any> = new Observable<any>();
  public getDrops$: Observable<any> = new Observable<any>();
  public moreDrops$: Observable<any> = new Observable<any>();
  public deleteDrops$: Observable<any> = new Observable<any>();
  public activeTab;
  public model;

  public overrideRainName: any = {};

  constructor(spacesService: SpacesService,
              spaceItemService: SpaceItemService,
              activatedRoute: ActivatedRoute,
              rainService: RainService,
              profileService: ProfileService) {
      super(spacesService, spaceItemService, activatedRoute, rainService, profileService);
  }

  ngOnDestroy() {
    this.rainService.drops[this.space.name] = this.drops = null;
  }

  ngOnInit() {
    // this.getCloudDrops$ = this.getSomeDrops();

    // this.getRainSchemas$ = this.getRawRain()
    // .switchMap(() => this.getRain());

  }

  private getSomeDrops(): any {

    const options = { limit: 10, after: Date.now(), type: false };
    // if (dropType) {
    //   options['type'] = dropType;
    // }
    // debugger;
    this.getDrops$ = this.rainService.getCloudDrops(options).do((drops) => {
      this.drops = _.groupBy(drops, 'type');
      console.log(this.drops)
      // this.activeTab =  dropType;
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
