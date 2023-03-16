import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'firstUpCase' })
export class FirstUpperCasePipe implements PipeTransform {

    constructor() { }

    transform(value: string): string {
        if(value.length > 0) {
            return value.charAt(0).toUpperCase() + value.toLowerCase().slice(1);
        } else {
            return '';
        }
    }
}
