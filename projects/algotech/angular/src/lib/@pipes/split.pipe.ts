import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'split'
})
export class SplitPipe implements PipeTransform {
    transform(value: string, delimiter: string, index: number = 0) {
        if (value === '') {
            return '';
        }
        const split = value.split(delimiter);
        if (split.length > index) {
            return split[index];
        }
        return '';
    }
}
