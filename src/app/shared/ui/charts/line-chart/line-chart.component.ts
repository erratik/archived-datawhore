import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { single, multi } from './data';

@Component({
  selector: 'datawhore-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.less']
})
export class LineChartComponent implements OnInit, OnChanges {

  single: any[];
  multi: any[];
  @Input() data: any;


  view: any[] = [1024, 300];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Population';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  // line, area
  autoScale = true;

  constructor() {
    Object.assign(this, { single, multi })
  }

  onSelect(event) {
    console.log(event);
  }

  ngOnChanges(data) {
    // console.log('hello', data)
    this.refreshStats(data.currentValue);

  }

  ngOnInit() {

    this.refreshStats(this.data);

    // throw new Error('Not implemented yet.');

  }


  public refreshStats(data): void {

    const dropStats = this.data.map(({ _id, count, drops }) => {
      const series = drops.map(drop => {
        return {name: drop.timestamp, value: 1}
      })
      return { name: _id, series }
    });
console.log(dropStats)

    // this.multi = dropStats.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
    // this.single = dropStats.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });


  }

  // public ngOnInit(): void {
  // }
}
