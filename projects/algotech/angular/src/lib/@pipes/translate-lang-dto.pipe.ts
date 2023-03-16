import { Pipe, PipeTransform } from '@angular/core';
import { LangDto } from '@algotech/core';
import { TranslateLangDtoService } from '../@services/translate-lang-dto.service';

@Pipe({ name: 'tlang' })
export class TranslateLangDtoPipe implements PipeTransform {

    constructor(private readonly translateLangDtoService: TranslateLangDtoService) { }

    transform(values: LangDto[], alertNoTranslate = true, lang?: string): string {
        return this.translateLangDtoService.transform(values, lang, alertNoTranslate);
    }
}
