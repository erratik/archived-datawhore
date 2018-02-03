import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'segmentFilter'
})
export class SegmentFilterPipe implements PipeTransform {

  transform( items: any, typeMatch: string, exclude = false ): any {
    return !exclude ? items.filter(item => item.type.includes(typeMatch)) : items.filter(item => !item.type.includes(typeMatch));
  }

}
