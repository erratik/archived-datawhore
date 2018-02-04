import * as moment from 'moment';
import { Component, OnInit } from '@angular/core';
import { CloudComponent } from 'app/views/cloud/cloud/cloud.component';
import { Router } from '@angular/router';
import { RainService } from 'app/services/rain.service';
import { SpaceItemService } from 'app/shared/services/space-item/space-item.service';
import { SpacesService } from 'app/services/spaces.service';
import { HexToRgb } from 'app/utils/hex-to-rgb.util';
import { StoryService } from 'app/services/story.service';

@Component({
  selector: 'datawhore-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent extends CloudComponent implements OnInit {

  public daterange = {};
  public selectedTimestamp = Date.now();
  public display = {};
  // public storyData: Drop;
  // public storyline: Storyline;
  public stories: any;

  constructor(spacesService: SpacesService,
    spaceItemService: SpaceItemService,
    rainService: RainService,
    router: Router,
    storyService: StoryService) {
    super(spacesService, spaceItemService, rainService, router, storyService);
  }


  ngOnInit() {
    this.getSpaces(() => this.getStory());
  }

  public getSpaces(callback = null): void {

    const getSpaceRain$ = this.spacesService.getAllSpaces().do((spaces) => this.spaces = spaces)
      .switchMap(() => this.rainService.getRain([]))
      .do((rain) => {
        this.rainService.rain = rain;
        debugger;
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

    options = !!options ? options : { day: Date.now() };

    const getStories$ = this.storyService.getStory(options).do((stories) => { this.stories = stories; });

    getStories$.subscribe(stories => {
      // console.log(this);
      // if (!!callback) {
      this.isLoadingSpaces = false;
      
      this.stories = stories.filter(story => story.content.date === moment(options.from || options.day).format('YYYYMMDD')).map(story => {
        story.content.segments = story.content.segments.map(segment => {
          segment.activities = segment.activities.map(activity => {
            activity.drops = this.rainService.enrichDrops(activity.drops);
            return activity;
          });
          segment.drops = this.rainService.enrichDrops(segment.drops);
          return segment;
        });
        return story;
      });

    });

  }



}
