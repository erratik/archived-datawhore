import { Component, OnInit } from '@angular/core';
import {SpaceModel} from '../../models/space.model';
import {SpacesService} from '../../services/spaces.service';

@Component({
  selector: 'datawhore-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.less']
})
export class ContainerComponent implements OnInit {

  constructor() {}

  ngOnInit() {

  }

}
