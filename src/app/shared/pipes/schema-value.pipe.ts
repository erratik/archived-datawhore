import { Pipe, PipeTransform } from '@angular/core';
const objectPath = require('object-path');

@Pipe({
  name: 'schemaValue'
})
export class SchemaValuePipe implements PipeTransform {

  transform(value: any, schemaType = '', schema): any {
    console.log(objectPath.get(schema, value));
    return objectPath.get(schema, value);
  }

}
