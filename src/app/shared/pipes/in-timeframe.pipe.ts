import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inTimeframe'
})
export class InTimeframePipe implements PipeTransform {

  transform(input: any, segment: any): any {

    return !!input && input.filter(itm => itm.timestamp > segment.startTime && itm.timestamp < segment.endTime);
  }

}
