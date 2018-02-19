import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'datawhore-simple-message',
  templateUrl: './simple-message.component.html',
  styleUrls: ['./simple-message.component.less']
})
export class SimpleMessageComponent implements OnInit {

  @Input() public message;
  @Input() public status;

  constructor() { }

  ngOnInit() {
  }


}
