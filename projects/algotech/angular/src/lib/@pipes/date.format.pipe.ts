import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
    name: 'dateFormat'
})

export class DateFormatPipe implements PipeTransform {
    transform(value: any, format: string, inputFormat?: string): any {
        if (!value) {
            return undefined;
        }
        if (inputFormat) {
            return moment(value, inputFormat).format(format);
        }
        return moment(value).format(format);
    }
}
