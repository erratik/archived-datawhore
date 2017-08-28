import { Pipe, PipeTransform } from '@angular/core';
const objectPath = require('object-path');

@Pipe({
  name: 'schemaValue'
})
export class SchemaValuePipe implements PipeTransform {

  transform(value: any, schema): any {
    schema.content = !!schema.content && typeof schema.content === 'string' ? JSON.parse(schema.content) : schema.content;
    const resolvedVal = objectPath.get(schema, value);
    return typeof resolvedVal === 'object' ? JSON.stringify(resolvedVal) : resolvedVal;
  }

}
