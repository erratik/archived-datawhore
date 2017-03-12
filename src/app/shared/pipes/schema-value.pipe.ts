import { Pipe, PipeTransform } from '@angular/core';
const objectPath = require('object-path');

@Pipe({
  name: 'schemaValue'
})
export class SchemaValuePipe implements PipeTransform {

  transform(value: any, schema): any {
    const resolvedVal = objectPath.get(schema, value);
    return typeof resolvedVal === 'object' ? JSON.stringify(resolvedVal) : resolvedVal;
  }

}
