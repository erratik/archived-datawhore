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
  @Input() public type: string;
  protected spaceIconImage: string;

  constructor(private spaceItemService: SpaceItemService) {}

  ngOnInit() {
    this.spaceIconImage = `public/uploads/${this.drop.space}/space/${this.drop.space}-icon.png`;
  }

  ngOnDestroy() {
    // this.obsRx.unsubscribe();
  }
}
