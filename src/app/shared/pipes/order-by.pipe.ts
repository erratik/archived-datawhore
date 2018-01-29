import { Pipe, PipeTransform } from '@angular/core';
@Pipe( {
    name: 'orderBy'
} )
export class OrderByPipe implements PipeTransform {
    transform( array: any, field: string, reverse = false ): Array<string> {
      if (!!array) {

        array.sort((a: any, b: any) => {
          if (a[field] < b[field]) {
            return -1;
          } else if (a[field] > b[field]) {
            return 1;
          } else {
            return 0;
          }
        });
        return reverse ? array : array.reverse();
      } else {
        return null;


      }
    }
}
