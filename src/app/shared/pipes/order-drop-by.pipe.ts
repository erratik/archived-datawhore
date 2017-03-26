import { Pipe, PipeTransform } from '@angular/core';
// const objectPath = require('object-path');
import * as _ from 'lodash';

@Pipe({
  name: 'orderDropBy'
})
export class OrderDropByPipe implements PipeTransform {

  transform( array: any, field: string): any {
    // console.log(array, orderPath);

    return _.orderBy(array, (arr) => arr['content'][field], 'desc');
  }

}
