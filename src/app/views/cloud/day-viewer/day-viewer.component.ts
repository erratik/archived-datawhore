import { Storyline } from '../../../models/storyline.model';
import { Drop } from '../../../models/drop.model';
import * as console from 'console';
import { Observable } from 'rxjs/Rx';
import { CloudComponent } from '../cloud/cloud.component';
import { SpaceItemService } from '../../../shared/services/space-item/space-item.service';
import { Router } from '@angular/router';
import { SpacesService } from '../../../services/spaces.service';
import { RainService } from '../../../services/rain/rain.service';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Segment } from 'app/models/segment.model';


@Component({
  selector: 'datawhore-day-viewer',
  templateUrl: './day-viewer.component.html',
  styleUrls: ['./day-viewer.component.less']
})
export class DayViewerComponent extends CloudComponent implements OnInit {

  public daterange = {};
  public selectedTimestamp = Date.now();
  public display = {};
  public storyData: Drop;
  public storyline: Storyline;
  public storyItems: any;

  constructor(spacesService: SpacesService,
    spaceItemService: SpaceItemService,
    rainService: RainService,
    router: Router) {
    super(spacesService, spaceItemService, rainService, router);
  }

  ngOnInit() {
    this.daterange = { max: moment().format('x'), min: moment().startOf('day').subtract(1, 'second').format('x') };
    // this.daterange = { min: moment().startOf('day').subtract(1, 'second').subtract(1, 'day').format('x'), max: moment().endOf('day').subtract(1, 'day').format('x') };
    this.options = { limit: 200, max: this.daterange['max'], min: this.daterange['min'], type: false };

    this.getRain();

  }

  public getRain(): void {

    const getSpaceRain$ = this.getSpaces(this.options);

    getSpaceRain$.subscribe(rain => {
      this.display = Object.keys(rain).map(spaceName => {
        const properties = {};
        properties[spaceName] = { visible: true };
        return properties;
      });

      if (this.hasStoryline()) {
        this.getStoryline();
        this.compileContent();
      }

    });

  }



  public hasStoryline(): boolean {
    const storylineExists = !!this.drops.filter(({ type }) => type === 'rain.storyline').length;
    return storylineExists;
  }

  public hasSegments(): boolean {
    return !!this.storyline.segments;
  }

  public enrichDrops(): void {
    this.storyData = this.drops.filter(({ type }) => type === 'rain.storyline')[0];

    this.drops = this.rainService.enrichDrops(this.drops);
    this.storyline = new Storyline(this.storyData.content, this.drops);
    this.storyline.drops = this.drops;
  }

  public getStoryline(): Storyline {

    this.enrichDrops();

    if (this.hasSegments()) {

      this.storyline.segments = this.storyline.segments.map(segment => {

        this.storyline.drops = this.storyline.findSegmentDrops(segment, this.drops, true);

        return segment;
      });
    }

    this.isLoadingSpaces = false;
    return this.storyline;

  }

  public compileContent(): any {
    this.storyItems = this.storyline.drops.concat(this.storyline.segments);

    this.storyItems = this.storyItems.map(story => {

      if (!!story.activities) {
        story.activities = story.activities.map(activity => {
          activity.timestamp = activity.startTime;
          return activity;
        });
        story.items = !!story.drops ? story.activities.concat(story.drops) : story.activities;
        // item.content.segments = item.content.segments.map(segment => {

        //   // delete segment.activities;
        //   // delete segment.drops;
        //   return segment;
        // });
        debugger;
      }
      return story;
    });
    // debugger;
  }


  public isActivityDrop(drop: Drop, activities: any): boolean {
    let inActivity;
    for (let i = 0; i <= activities.length - 1; i++) {
      const startTime = Number(moment(activities[i].startTime).format('x'));
      const endTime = Number(moment(activities[i].endTime).format('x'));

      inActivity = drop.timestamp >= startTime && drop.timestamp <= endTime;
      // debugger;

    }
    // debugger;
    return inActivity;
  }


  public nextDayIsFuture(): boolean {
    return Number(moment(this.selectedTimestamp).add(1, 'day').startOf('day').format('x')) >= Date.now();
  }

  public changeDateRange(value: any): void {

    this.drops = [];
    this.isLoadingSpaces = true;
    const timestamp = typeof value === 'number' ? value : this.selectedTimestamp;

    this.daterange = {
      min: moment(value).startOf('day').subtract(1, 'second').format('x'),
      max: moment(value).endOf('day').format('x')
    };

    this.options = {
      limit: 200,
      max: this.daterange['max'],
      min: this.daterange['min'],
      type: false
    };

    const dayMs = 1000 * 3600 * 24; // one day in milliseconds
    let t = 0;
    if (value === '-1') {
      t = timestamp - dayMs;
    } else if (value === '+1') {
      t = timestamp + dayMs;
    }
    if (typeof value !== 'number') {
      this.options.min = moment(t).startOf('day').subtract(1, 'second').format('x');
      this.options.max = moment(t).endOf('day').format('x');
    }

    this.selectedTimestamp = Number(moment(Number(this.options.max)).format('x'));

    this.getRain();
  }

  public toggleSpaceDrops(spaceName: string): void {
    this.display[spaceName].visible = !this.display[spaceName].visible;
  }

  public dropsHidden(spaceName: string): boolean {
    return !!this.display[spaceName] && !this.display[spaceName].visible;
  }

}
