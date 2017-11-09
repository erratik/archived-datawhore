import { Observable } from 'rxjs/Rx';
import { any } from 'codelyzer/util/function';
import { RainService } from '../../../services/rain/rain.service';
import { Component, OnInit } from '@angular/core';
import { SpacesService } from '../../../services/spaces.service';
import { Space } from '../../../models/space.model';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { OauthSettingsService } from '../../../services/space/oauth-settings.service';
import { SpaceItemService } from '../../../shared/services/space-item/space-item.service';
import { Drop } from 'app/models/drop.model';
import * as _ from 'lodash';
import { DimensionSchema } from 'app/models/dimension-schema.model';

@Component({
  selector: 'datawhore-cloud',
  templateUrl: './cloud.component.html',
  styleUrls: ['./cloud.component.less']
})
export class CloudComponent implements OnInit {
  protected isLoadingSpaces = true;
  public spaces: Space[];
  public dropSpaces: string[];
  public myStyle: any;
  public drops: any = [];
  public newDrops: any = [];
  public dropRepository: any = [];
  public dropsBySpace = [];
  public options: any = { limit: 50, max: Date.now(), type: false };
  public getDrops$ = new Observable<any>();
  public getSpaces$ = new Observable<any>();


  constructor(public spacesService: SpacesService,
    public spaceItemService: SpaceItemService,
    public rainService: RainService,
    public router: Router) {
  }

  ngOnInit() {


    this.getSpaces$ = this.getSpaces(this.options);

    this.getSpaces$.subscribe(() => {
      // debugger;

      // this.newDrops = [];
    });

  }

  public getSpaces(options): any {
    return this.spacesService.getAllSpaces()
      .do((spaces) => {
        this.spaces = spaces;
        this.dropsBySpace = spaces.map(({ display, name }) => {
          return {
            color: display.color,
            count: 0,
            name
          };
        });
        return spaces;
      })
      .switchMap((spaces) => this.rainService.getCloudDrops(options))
      .do((cloudDrops) => {

        this.drops = [];

        this.dropsBySpace = this.dropsBySpace.map(dropSpace => {
          const cloud = cloudDrops.filter(_cloud => _cloud._id === dropSpace.name)[0];
          if (!!cloud) {
            dropSpace.count = cloud.count;
            this.drops = this.drops.concat(cloud.drops);
            return dropSpace;
          }
        }).filter(d => d);

        // return this.spaces;

      })
      .do((spaces) => {

        const getRain$ = this.rainService.getRain(this.dropsBySpace.map(({ name }) => name));

        getRain$.subscribe((rain) => {

          console.log(rain);
          console.log(this.rainService.rain);
          this.drops = this.rainService.enrichDrops(this.drops);
          // this.newDrops = this.newDrops.map(d => {
          //   d.space = space;
          //   return d;
          // // })
          // this.drops = this.drops.concat(this.rainService.enrichDrops(this.newDrops.filter(({ type }) => rain[space][0].rainType === type)));

          // console.log(this.newDrops.filter(({ type }) => rain[space][0].rainType === type));
          // console.log(this.rainService.rain);

          this.isLoadingSpaces = false;
        });

      });
  }

  public getRawRain(space): any {
    return this.spaceItemService.fetchSchema(space, 'rain').do((rain) => {

      this.rainService.rainSchemas[space] = rain.map(rainSchema => this.toSchema(rainSchema));
      // debugger;
    });
  }

  public getMoreDrops(): any {
    let newDrops = [];

    this.options.max = _.minBy(this.drops, (o) => o['timestamp'])['timestamp'];


    const getMoreDrops$ = this.rainService.getCloudDrops(this.options).do((cloudDrops) => {
      this.newDrops = [];
      cloudDrops.forEach(({ drops }) => {
        this.newDrops = this.newDrops.concat(drops);
      });

      this.generateCloud(cloudDrops);


      return this.spaces;
    });


    getMoreDrops$.subscribe((spaces) => {

      const source = Observable.range(0, spaces.length).combineLatest(x => {
        return spaces[x]._id;
      });

      source.subscribe((space) => {
        const getRain$ = this.rainService.getSpaceRain(space);

        getRain$.subscribe(() => {
          this.drops = this.drops.concat(this.rainService.enrichDrops(this.newDrops.filter(drop => drop.space === space)));
        });
      });
    });
  }


  public getDropFlex(dropSpace): string {
    return '1 1 ' + dropSpace.count / this.drops.length * 100 + '%';
  }


  public generateCloud(cloudDrops, newDrops = null): any {
    // this.dropRepository.push(cloudDrops);
    this.dropRepository = cloudDrops.map(({ _id, drops, count }) => {
      return { _id, drops, count };
    });

    const spacesFetched: string[] = cloudDrops.map(({ _id }) => _id);
    const existingSpaces: string[] = this.dropsBySpace.map(({ _id }) => _id);
    const allSpaces: string[] = _.uniq(spacesFetched.concat(existingSpaces));

    this.dropsBySpace = allSpaces.map(space => {
      const spaceRepo = this.dropRepository.filter(o => o._id === space)[0];

      const spaceObj = { _id: space, color: this.spaces.filter((s: Space) => s.name === space)[0].display.color };

      if (!existingSpaces.includes(space)) {
        spaceObj['drops'] = spaceRepo.drops;
        spaceObj['count'] = spaceRepo.count;
      } else {
        const dropSpace = this.dropsBySpace.filter(o => o._id === space);
        const prevDrops = dropSpace.length ? dropSpace[0].drops : [];
        const spawnDrops = !!spaceRepo ? spaceRepo.drops.concat(prevDrops) : prevDrops;
        spaceObj['drops'] = spawnDrops;
        spaceObj['count'] = spawnDrops.length;
      }

      return spaceObj;
    });

    this.dropSpaces = this.dropsBySpace.map(({ _id }) => _id);

    this.spaces = this.spaces.filter(({ name }) => this.dropSpaces.includes(name));

  }

  // todo: this needs to move to DimensionService or RainService?
  public toSchema(preSchema): DimensionSchema {

    if (typeof preSchema.content === 'string') {
      preSchema.content = JSON.parse(preSchema.content);
      if (preSchema.content.length) {
        const merged = {};
        preSchema.content.forEach(d => Object.keys(d).forEach(k => { merged[k] = d[k]; }));
        preSchema.content = merged;
      }
    }
    return new DimensionSchema(
      preSchema.type,
      preSchema.content,
      preSchema.modified,
      preSchema.fetchUrl,
      preSchema.dropUrl,
      preSchema.contentPath,
      preSchema._id
    );
  }

}
