import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keys'
})
export class KeyPipe implements PipeTransform {
  transform(input, args: string[]): any {
    let keys = [];
    Object.keys(input).forEach(key => keys.push({ key: key, value: input[key] }));
    return keys;
  }
}
