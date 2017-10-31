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
import { Drop } from "app/models/drop.model";
import * as _ from 'lodash';
import { DimensionSchema } from "app/models/dimension-schema.model";

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
  public options: any = { limit: 50, after: Date.now(), type: false };
  public getDrops$ = new Observable<any>();
  public getSpaces$ = new Observable<any>();


  constructor(private spacesService: SpacesService,
    private spaceItemService: SpaceItemService,
    private rainService: RainService,
    private router: Router) {
  }

  ngOnInit() {


    this.getSpaces$ = this.spacesService.getAllSpaces().switchMap((spaces) => {
      this.spaces = spaces;
      this.getDrops$ = this.rainService.getCloudDrops(this.options).do((cloudDrops) => {

        this.generateCloud(cloudDrops);

        this.dropsBySpace.forEach(({ drops }) => {
          this.newDrops = this.newDrops.concat(drops);
        });

        return this.spaces;

      });
      return this.getDrops$;
    })
      .do((spaces) => {
        this.isLoadingSpaces = false;
        const that = this;
        const source = Observable.range(0, this.spaces.length).combineLatest(x => that.spaces[x].name);

        source.subscribe((space) => {
          const getRain$ = that.rainService.getRain(space);

          getRain$.subscribe((rain) => {
            this.newDrops = this.newDrops.map(d => {
              d.space = space;
              return d;
            })
            this.drops = this.drops.concat(this.rainService.enrichDrops(this.newDrops.filter(({type}) => rain[space][0].rainType === type)));

            console.log(this.newDrops.filter(({type}) => rain[space][0].rainType === type));
            console.log(this.rainService.rain);
          });
        });
      });

    this.getSpaces$.subscribe(() => {
      // debugger;
      
      // this.newDrops = [];
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
    
    this.options.after = _.minBy(this.drops, (o) => o['timestamp'])['timestamp'];


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
          const getRain$ = this.rainService.getRain(space);

          getRain$.subscribe(() => {
            this.drops = this.drops.concat(this.rainService.enrichDrops(this.newDrops.filter(drop => drop.space === space)));
          });
        });
      });
  }
  

  public getDropFlex(dropSpace): any {

      return '1 0 ' + dropSpace.drops.length / this.drops.length * 100 + '%';
  }


  public generateCloud(cloudDrops, newDrops = null): any {
    // this.dropRepository.push(cloudDrops);
    this.dropRepository  = cloudDrops.map(({_id, drops, count}, k) => {
        const space = this.dropsBySpace.filter(o => o._id === _id);
        const prevCount = space.length ? space[0].count : 0;
        const prevDrops = space.length ? space[0].drops : [];
        return {_id, drops: drops, count: count };
    });
    const spacesFetched = cloudDrops.map(({_id}) => _id);
    const existingSpaces = this.dropsBySpace.map(({_id}) => _id);
    const allSpaces = _.uniq(spacesFetched.concat(existingSpaces));
    // debugger;Î
    this.dropsBySpace = allSpaces.map(space => {
      let spaceRepo = this.dropRepository.filter(o => o._id === space)[0];
      if (!existingSpaces.includes(space)) {
        console.log(this.drops.length);
        return {_id: space, drops: spaceRepo.drops, count: spaceRepo.count};
      } else {
          const dropSpace = this.dropsBySpace.filter(o => o._id === space);
          // const prevCount = dropSpace.length ? dropSpace[0].count : 0;
          const prevDrops = dropSpace.length ? dropSpace[0].drops : [];
          const spawnDrops = !!spaceRepo ? spaceRepo.drops.concat(prevDrops) : prevDrops;

          return {_id: space, drops: spawnDrops, count: spawnDrops.length};
          // return {_id: space, drops: spaceRepo.drops, count: spaceRepo.count};
      }

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
