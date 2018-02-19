import { Storyline } from '../../../models/storyline.model';
import { Drop } from '../../../models/drop.model';
import { Observable } from 'rxjs/Rx';
import { CloudComponent } from '../cloud/cloud.component';
import { SpaceItemService } from '../../../shared/services/space-item/space-item.service';
import { Router } from '@angular/router';
import { SpacesService } from '../../../services/spaces.service';
import { RainService } from '../../../services/rain.service';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Segment } from 'app/models/segment.model';
import { StoryService } from 'app/services/story.service';


@Component({
  selector: 'datawhore-day-viewer',
  templateUrl: './day-viewer.component.html',
  styleUrls: ['./day-viewer.component.less']
})
export class DayViewerComponent extends CloudComponent implements OnInit {

  
  public daterange = {};
  public selectedTimestamp = Date.now();
  public display = {};
  public stats = null;
  public status = '';
  public message = '';
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
    // this.getSpaces(() => this.getStory());
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

  public toggleSpaceDrops(spaceName: string): void {
    this.display[spaceName].visible = !this.display[spaceName].visible;
  }

  public dropsHidden(spaceName: string): boolean {
    return !!this.display[spaceName] && !this.display[spaceName].visible;
  }

}
