import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
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
  @Output() public onRemove = new EventEmitter<Drop>();

  constructor(private spaceItemService: SpaceItemService) {}

  ngOnInit() {
    this.spaceIconImage = `http://datawhore.erratik.ca:10010/public/uploads/${this.drop.space}/space/${this.drop.space}-icon.png`;
  }


  public deleteDrop(): any {
    this.onRemove.emit(this.drop);
  }

  ngOnDestroy() {
    // this.obsRx.unsubscribe();
  }
}
