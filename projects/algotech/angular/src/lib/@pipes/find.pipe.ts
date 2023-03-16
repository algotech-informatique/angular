import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({ name: 'find' })
export class FindPipe implements PipeTransform {

    transform(array: any[], propName: string, search: any): any {
        return array.find((object) => object[propName] === search);
    }

}
