import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valuesPipe'
})
export class ValuesPipePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
