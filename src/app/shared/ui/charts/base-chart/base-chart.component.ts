
import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'datawhore-base-chart',
  templateUrl: './base-chart.component.html',
  styleUrls: ['./base-chart.component.css']
})
export class BaseChartComponent implements OnInit {

  @Input() public data: any;
  public loadedData = false;

  // Chart Options
  public datasets: any[] = [{
    data: [6000]
  }];
  public labels: string[] = ['total'];

  constructor() { }


  ngOnInit() {}

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

}
