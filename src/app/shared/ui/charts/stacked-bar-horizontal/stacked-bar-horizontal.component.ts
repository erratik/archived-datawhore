import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { single, multi } from './data';

@Component({
  selector: 'datawhore-stacked-bar-horizontal',
  template: `
    <ngx-charts-bar-horizontal-stacked
      [view]="view"
      [scheme]="colorScheme"
      [results]="multi"
      [gradient]="gradient"
      [xAxis]="showXAxis"
      [yAxis]="showYAxis"
      [legend]="showLegend"
      [showXAxisLabel]="showXAxisLabel"
      [showYAxisLabel]="showYAxisLabel"
      [xAxisLabel]="xAxisLabel"
      [yAxisLabel]="yAxisLabel"
      (select)="onSelect($event)">
    </ngx-charts-bar-horizontal-stacked>
  `,
  styleUrls: ['./stacked-bar-horizontal.component.less']
})
export class StackedBarHorizontalComponent implements OnInit, OnChanges {

  @Input() data: any;

  single: any[];
  multi: any[];

  view: any[] = [200, 50];

  // options
  showXAxis = false;
  showYAxis = false;
  gradient = false;
  showLegend = false;
  showXAxisLabel = false;
  xAxisLabel = 'Country';
  showYAxisLabel = false;
  yAxisLabel = 'Population';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor() {
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
    const set = this.data.map(stat => {
      return { name: stat.space, value: stat.count };
    });

    this.multi = [{
      name: 'activity',
      'series': set
    }];
  }

}
