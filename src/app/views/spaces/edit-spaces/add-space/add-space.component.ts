import { Component, OnInit } from '@angular/core';
import {SpaceModel} from '../../../../models/space.model';

@Component({
  selector: 'datawhore-add-space',
  templateUrl: './add-space.component.html',
  styleUrls: ['./add-space.component.less']
})
export class AddSpaceComponent implements OnInit {

  protected newSpace: SpaceModel = null;

  model = new SpaceModel('', Date.now());

  submitted = false;

  onSubmit() { this.submitted = true; }

  // TODO: Remove this when we're done
  get diagnostic() { return JSON.stringify(this.model); }

  constructor() { }

  ngOnInit() {

  }

}
