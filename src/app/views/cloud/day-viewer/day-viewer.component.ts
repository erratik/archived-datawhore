import { timestamp } from 'angular2-color-picker/node_modules/rxjs/operator/timestamp';
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


@Component({
  selector: 'datawhore-day-viewer',
  templateUrl: './day-viewer.component.html',
  styleUrls: ['./day-viewer.component.less']
})
export class DayViewerComponent extends CloudComponent implements OnInit {

  public daterange = {};
  public display = {};
  public storyline: Drop = null;

  constructor(spacesService: SpacesService,
    spaceItemService: SpaceItemService,
    rainService: RainService,
    router: Router) {
    super(spacesService, spaceItemService, rainService, router);
  }

  ngOnInit() {
    this.daterange = { max: moment().format('x'), min: moment().startOf('day').subtract(1, 'second').format('x') };
    this.options = { limit: 200, max: this.daterange['max'], min: this.daterange['min'], type: false };
    this.getSpaces(this.options).subscribe(spaces => {
      this.spaces.forEach(space => {
        this.display[space.name] = {
          visible: true
        };
      });

      if (this.hasStoryline()) {
        this.getStoryline();
      }
      // debugger
    });
  }


  public changeDateRange(key, value): void {
    this.drops = [];
    this.isLoadingSpaces = true;
    this.daterange = { min: moment(value).startOf('day').subtract(1, 'second').format('x'), max: moment(value).endOf('day').format('x') };
    // debugger;
    this.options = { limit: 200, max: this.daterange['max'], min: this.daterange['min'], type: false };
    this.getSpaces(this.options).subscribe();

  }

  public toggleSpaceDrops(space: string): void {
    this.display[space].visible = !this.display[space].visible;
  }

  public hasStoryline(): boolean {
    return this.drops.filter(({type}) => type === 'rain.storyline').length;
  }

  public getStoryline(): void {
    this.storyline = this.drops.filter(({type}) => type === 'rain.storyline')[0];
  }

  public timestampIsBetween(drop: Drop, segment: any): boolean {
    return drop.timestamp >= Number(moment(segment.startTime).format('x')) && drop.timestamp <= Number(moment(segment.endTime).format('x'));
  }

}
