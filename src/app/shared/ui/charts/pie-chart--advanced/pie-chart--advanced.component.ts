import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { single, multi } from './data';

@Component({
  selector: 'datawhore-pie-chart-advanced',
  templateUrl: './pie-chart--advanced.component.html',
  styleUrls: ['./pie-chart--advanced.component.css']
})
export class PieChartAdvancedComponent implements OnInit, OnChanges {

  single: any[];
  multi: any[];
  @Input() data: any;

  view: any[] = [1024, 200];

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor() {
    Object.assign(this, { single, multi })

  }

  ngOnChanges(change) {
    console.log('hello', change);
    this.refreshStats(change.data.currentValue);

  }

  ngOnInit() {

    this.refreshStats(this.data);


  }

  onSelect(event) {
    console.log(event);
  }

  public refreshStats(data): void {
    debugger;
    const dropStats = data.map(({ name, value }) => {
      return { name, value };
    });


    this.single = dropStats.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });


  }


}
