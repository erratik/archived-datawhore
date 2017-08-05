import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Drop } from '../../../models/drop.model';
import {SpaceItemService} from '../../../shared/services/space-item/space-item.service';

@Component({
  selector: 'datawhore-drop-atomic',
  templateUrl: './drop-atomic.component.html',
  styleUrls: ['./drop-atomic.component.less']
})
export class DropAtomicComponent implements OnInit, OnDestroy {


  @Input() public drop: Drop;

  constructor(private spaceItemService: SpaceItemService) {}

  ngOnInit() {
  }

  ngOnDestroy() {
    // this.obsRx.unsubscribe();
  }
}
