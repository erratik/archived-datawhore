import { Pipe, PipeTransform } from '@angular/core';
// const objectPath = require('object-path');
import * as _ from 'lodash';

@Pipe({
  name: 'orderDropBy'
})
export class OrderDropByPipe implements PipeTransform {

  transform( array: any, fields: any, orders: any = ['desc']): any {
    return _.orderBy(array, fields, orders);
  }

}
