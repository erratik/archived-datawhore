import * as moment from 'moment';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Logger } from '../../../shared/services/common';
import { RainService } from '../../../shared/services/rain.service';
import { SpaceItemService } from '../../../shared/services/space-item.service';
import { SpacesService } from '../../../shared/services/spaces.service';
import { StoryService } from '../../../shared/services/story.service';
import { CloudComponent } from '../../cloud/cloud/cloud.component';

import { HexToRgb } from '../../../utils/hex-to-rgb.util';


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
