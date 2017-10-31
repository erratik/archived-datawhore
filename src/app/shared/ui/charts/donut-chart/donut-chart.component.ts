import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'datawhore-donut-chart',
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.css']
})
export class DonutChartComponent implements OnInit, OnChanges {

  @Input() data: any;

  // Doughnut
  public doughnutChartLabels: string[] = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
  public doughnutChartData: number[] = [350, 450, 100];
  public doughnutChartType = 'doughnut';
  public doughnutChartOptions = {
    cutoutPercentage: 90,
    legend: false
  };

  constructor() { }

  ngOnChanges(change) {
    console.log('change detected:', change);

  }

  ngOnInit() {
    console.log('data', this.data);
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

}
