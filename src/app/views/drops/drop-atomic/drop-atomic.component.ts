import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Drop } from '../../../models/drop.model';

@Component({
  selector: 'datawhore-drop-atomic',
  templateUrl: './drop-atomic.component.html',
  styleUrls: ['./drop-atomic.component.less']
})
export class DropAtomicComponent implements OnInit, OnDestroy {


  @Input() public drop: Drop;

  constructor() {}

  ngOnInit() {

  }

  ngOnDestroy() {
    // this.obsRx.unsubscribe();
  }
}
