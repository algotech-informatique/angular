import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LangDto } from '@algotech/core';
import localeFR from '@angular/common/locales/fr';
import localeEN from '@angular/common/locales/en';
import localeES from '@angular/common/locales/es';
import localeDE from '@angular/common/locales/de';
import { registerLocaleData } from '@angular/common';

@Injectable()
export class TranslateLangDtoService {

    private _lang: string;
    private _fallBackTranslation = '[no translation available]';

    constructor(
        private readonly translateService: TranslateService,
    ) {
        registerLocaleData(localeFR);
        registerLocaleData(localeEN);
        registerLocaleData(localeES);
        registerLocaleData(localeDE);
    }

    get lang() {
        if (!this._lang) {
            this._lang = this.translateService.currentLang ||
                this.translateService.getBrowserCultureLang() ||
                'en-US';
        }
        return this._lang;
    }

    set lang(lang: string) {
        this._lang = lang;
    }

    transform(values: LangDto[], lang?: string, alertNoTranslate = true): string {
        let translation;

        if (values.length === 0) {
            return alertNoTranslate ? this._fallBackTranslation : '';
        }

        if (lang) {
            translation = values.find(l => l.lang === lang);
        } else {
            translation = values.find(l => l.lang === this.lang);
        }

        return translation && (translation.value != null && translation.value !== '') ? translation.value : (alertNoTranslate ? this._fallBackTranslation : '');
    }

}
