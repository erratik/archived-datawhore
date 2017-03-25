import { ControlValueAccessor } from '@angular/forms/src/directives';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valuesPipe'
})
export class ValuesPipe implements PipeTransform {
  transform(input: any, args: any[] = null): any {
    // console.log(Object.keys(input));
    return Object.keys(input).map(key => input[key]);
  }
}
