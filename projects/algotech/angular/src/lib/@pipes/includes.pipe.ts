import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({ name: 'includes' })
export class IncludesPipe implements PipeTransform {

    transform(array: any[], search: string): any {
        return array.includes(search);
    }

}
