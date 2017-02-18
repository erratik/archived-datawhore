import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'datawhore-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {

  title = 'datawhore';

  constructor() {

  }

  ngOnInit() {
  }

}
