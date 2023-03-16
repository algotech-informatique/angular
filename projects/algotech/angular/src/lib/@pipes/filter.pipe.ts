import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {

    transform(array: any[], propName: string, search: any): any[] {
        return array.filter((object) => object[propName] === search);
    }

}
