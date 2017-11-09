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
  styleUrls: ['./day-viewer.component.css']
})
export class DayViewerComponent extends CloudComponent implements OnInit {

  public daterange = {};

  constructor(spacesService: SpacesService,
    spaceItemService: SpaceItemService,
    rainService: RainService,
    router: Router) {
    super(spacesService, spaceItemService, rainService, router);
  }

  ngOnInit() {
    
    this.daterange = { max: moment().format('x'), min: moment().startOf('day').subtract(1, 'second').format('x')};
    
    this.options = { limit: 200, max: this.daterange['max'], min: this.daterange['min'], type: false };
    this.getSpaces(this.options).subscribe();

  }


  public changeDateRange(key, value): void {
    
    this.drops = [];
    this.daterange = { min: moment(value).startOf('day').subtract(1, 'second').format('x'), max: moment(value).endOf('day').format('x')};
    debugger;
    this.options = { limit: 200, max: this.daterange['max'], min: this.daterange['min'], type: false };
    this.getSpaces(this.options).subscribe();

  }

}
