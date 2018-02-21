import { ActivatedRoute } from '@angular/router';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

import { SpaceItemService } from '../../../services/space-item.service';
import { SpacesService } from '../../../services/spaces.service';
import { RainService } from '../../../services/rain.service';
import { Space } from '../../../models/space.model';
import { ProfileService } from '../../../services/profile.service';

import { RainConfigComponent } from '../../../../space-admin/component/rain-configs/rain-configs.component';
import { OauthSettingsService } from '../../../../space-admin/services/oauth-settings.service';

@Component({
  selector: 'datawhore-drops',
  templateUrl: './drops.component.html',
  styleUrls: ['./drops.component.less']
})
export class DropsComponent extends RainConfigComponent implements OnInit, OnDestroy {

  @Input() public space: Space;
  public drops;
  public dropTypes;
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
    rainService: RainService,
    profileService: ProfileService) {
    super(spacesService, spaceItemService, activatedRoute, rainService, profileService);
  }

  ngOnDestroy() {
    this.rainService.drops[this.space.name] = this.drops = null;
  }

  ngOnInit() {

    this.getRainSchemas$ = this.getSpaceRain();

    this.getRainSchemas$.subscribe(() => {
      this.rain = this.rainService.rain;
      this.activeTab = this.rainService.type = this.rain[this.space.name].length ? this.rain[this.space.name][0].rainType : this.activeTab;


      if (this.rain[this.space.name].length) {
        this.dropTypes = this.rain[this.space.name].map(rain => rain.rainType);
        this.getSomeDrops(this.dropTypes[0]);
      }
    });
  }

  private getSomeDrops(dropType = null): any {

    const options = { limit: 10, after: Date.now() };
    if (dropType) {
      options['type'] = dropType;
    }

    this.getDrops$ = this.rainService.getDrops(this.space.name, options).do((drops) => {
      this.drops = _.groupBy(drops, 'type');
      this.activeTab = dropType;
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
      console.log(drops);
    });

    this.deleteDrops$.subscribe((newDrops) => {
      this.isLoading = !this.isLoading;
    });
  }


}
