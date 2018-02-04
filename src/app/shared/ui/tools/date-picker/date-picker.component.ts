import { SpacesService } from '../../../../services/spaces.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DatepickerOptions } from 'ng2-datepicker';
import * as moment from 'moment';

@Component({
  selector: 'datawhore-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.less']
})


export class DatePickerComponent implements OnInit {

  @Input() public date: Date;
  @Input() public selectedTimestamp: any;
  @Output() public onDateRangeChange: EventEmitter<number> = new EventEmitter<number>();

  public options: DatepickerOptions = {
    minYear: 2011,
    maxYear: 2030, // Maximal selectable date
    displayFormat: 'MMM D[,] YYYY',
    barTitleFormat: 'MMMM YYYY',
    firstCalendarDay: 0, // 0 - Sunday, 1 - Monday
    maxDate: new Date(Date.now())
  };
  constructor(private spacesService: SpacesService) { }

  ngOnInit() {
    this.date = new Date();
  }

  public changeDate(date: number): void {
    const d = Number(date);
    this.onDateRangeChange.emit(d);
  }

  public nextDayIsFuture(): boolean {
    return Number(moment(this.selectedTimestamp).add(1, 'day').startOf('day').format('x')) >= Date.now();
  }

}
