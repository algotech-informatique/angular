import { Pipe, PipeTransform } from '@angular/core';
import { TranslateLangDtoService } from '../@services/translate-lang-dto.service';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'localeDate' })
export class LocaleDatePipe implements PipeTransform {

    constructor(
        private datePipe: DatePipe,
        private readonly translateLangDtoService: TranslateLangDtoService) { }

    transform(isoDate: string, format?: string): string {
        if (!isoDate || isoDate === '') {
            return '';
        }
        return this.datePipe.transform(isoDate, format, null, this.translateLangDtoService.lang);
    }
}
