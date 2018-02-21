import * as moment from 'moment';
import { Component, OnInit } from '@angular/core';
import { CloudComponent } from 'app/views/cloud/cloud/cloud.component';
import { Router } from '@angular/router';
import { RainService } from 'app/services/rain.service';
import { SpaceItemService } from 'app/shared/services/space-item/space-item.service';
import { SpacesService } from 'app/services/spaces.service';
import { HexToRgb } from 'app/utils/hex-to-rgb.util';
import { StoryService } from 'app/services/story.service';
import { Logger } from 'app/shared/ui/ng2-threejs/src/common/log.service';

@Component({
  selector: 'datawhore-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent extends CloudComponent implements OnInit {

  public daterange = {};
  public selectedTimestamp = Date.now();
  public display = {};
  public stats = {};
  public status = '';
  public message = '';
  // public storyline: Storyline;
  public stories: any;

  public log: Logger;

  constructor(spacesService: SpacesService,
    spaceItemService: SpaceItemService,
    rainService: RainService,
    router: Router,
    storyService: StoryService,
    log: Logger) {
    super(spacesService, spaceItemService, rainService, router, storyService, log);
    this.log = log;
  }

  ngOnInit() {
    this.log.info('Loaded home');
    this.getStory();
  }

  public getSpaces(callback = null): void {

    const getSpaceRain$ = this.spacesService.getAllSpaces().do((spaces) => this.spaces = spaces)
      .switchMap(() => this.rainService.getRain([]))
      .do((rain) => {
        this.rainService.rain = rain;
        return this.spaces;
      });


    getSpaceRain$.subscribe(rain => {
      this.display = Object.keys(rain).map(spaceName => {
        const properties = {};
        properties[spaceName] = { visible: true };
        return properties;
      });

      if (!!callback) {
        callback();
      }
    });

  }

  public getStory(options = null): void {

    options = !!options ? options : { day: moment(Date.now()).format('YYYYMMDD') };

    const getStories$ = this.storyService.getStory(options).do((storyResponse) => {
      this.stories = storyResponse.items;
      this.stats = storyResponse.stats;
      this.status = storyResponse.status;
      this.message = storyResponse.msg;

      this.selectedTimestamp = Number(moment(options.from || options.day).format('x'));
      this.isLoadingSpaces = false;
    });

    getStories$.subscribe(stories => {
      // this.stories = stories;

    });

  }

  public changeDateRange(timestamp: any): void {
    this.stories = [];
    this.isLoadingSpaces = true;
    this.getStory({ day: moment(timestamp).format('YYYYMMDD') });
  }
}
