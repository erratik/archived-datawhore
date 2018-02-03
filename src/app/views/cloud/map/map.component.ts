import { Component, OnInit } from '@angular/core';
import { CloudComponent } from 'app/views/cloud/cloud/cloud.component';
import { Router } from '@angular/router';
import { RainService } from 'app/services/rain/rain.service';
import { SpaceItemService } from 'app/shared/services/space-item/space-item.service';
import { SpacesService } from 'app/services/spaces.service';

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
  // public storyItems: any;

  constructor(spacesService: SpacesService,
    spaceItemService: SpaceItemService,
    rainService: RainService,
    router: Router) {
    super(spacesService, spaceItemService, rainService, router);
  }


  ngOnInit() {
  }

}
