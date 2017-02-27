import { Component, OnInit } from '@angular/core';
import {Space} from '../../../../models/space.model';

@Component({
  selector: 'datawhore-add-space',
  templateUrl: './add-space.component.html',
  styleUrls: ['./add-space.component.less']
})
export class AddSpaceComponent implements OnInit {

  protected newSpace: Space = null;

  model = new Space('', Date.now());

  submitted = false;

  onSubmit() { this.submitted = true; }

  // TODO: Remove this when we're done
  get diagnostic() { return JSON.stringify(this.model); }

  constructor() { }

  ngOnInit() {

  }

}
