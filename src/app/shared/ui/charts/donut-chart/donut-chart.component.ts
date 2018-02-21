import { BaseChartComponent } from '../base-chart/base-chart.component';
import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'chart-doughnut',
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.css']
})
export class DoughnutChartComponent extends BaseChartComponent implements OnInit, OnChanges {

  public chartType = 'doughnut';
  public options = {
    cutoutPercentage: 80,
    legend: false
  };

  public colors: Array<any> = [{ backgroundColor: ['#CCCCCC'] }];

  @Input() color: string = null;

  constructor() { super(); }

  ngOnChanges(change) {
    // console.log('change detected:', change);
    this.setChartData(change.data.currentValue);
  }

  ngOnInit() {
  }

  public setChartData(data): void {
    if (!!data) {
      // console.log(data);
      // debugger;
      const computedLabels = data.map(({ type }) => type);
      const computedValues = data.map(({ count }) => count);
      // const computedColors = data.map(() => );

      this.colors[0].backgroundColor.unshift(this.color);
      this.labels = computedLabels.concat(this.labels);

      const sumValues = computedValues.length > 1 ? computedValues.reduce((a, c) => a + c) : computedValues[0];
      this.datasets[0].data[0] = this.datasets[0].data[0] - sumValues;
      this.datasets[0].data = computedValues.concat(this.datasets[0].data);

      // debugger;
      this.loadedData = true;
    }
  }


}
