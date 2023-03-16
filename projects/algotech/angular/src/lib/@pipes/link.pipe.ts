import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({ name: 'link' })
export class LinkPipe implements PipeTransform {

    transform(key: string, args: any[]) {
        const expectedResult = _.find(args[2], [args[1], key]);
        if (expectedResult && args[0] in expectedResult) {
            return expectedResult[args[0]];
        } else {
            return null;
        }
    }
}
