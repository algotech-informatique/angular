import { Inject, Injectable } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { includes } from 'lodash';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import moment from 'moment';
import { EnvService } from '../base/env.service';

const languageKey = 'language';

export function extract(s: string) {
    return s;
}

@Injectable()
export class I18nService {

    defaultLanguage: string;
    supportedLanguages: string[];

    constructor(
        protected http: HttpClient,
        protected env: EnvService,
        private translateService: TranslateService,
        @Inject(APP_BASE_HREF) public baseHref: string,
    ) {
        
        this.translateService.currentLoader = new TranslateHttpLoader(this.http, (this.baseHref?.startsWith('/') ? '.' : './') + this.baseHref + 'assets/i18n/', '.json');
       
    }

    init(defaultLanguage: string, supportedLanguages: string[]) {
        this.defaultLanguage = defaultLanguage;
        this.supportedLanguages = supportedLanguages;
        this.language = '';

        this.translateService.onLangChange
            .subscribe((event: LangChangeEvent) => { localStorage.setItem(languageKey, event.lang); });
    }

    set language(language: string) {
        language = language || localStorage.getItem(languageKey) || this.translateService.getBrowserCultureLang();
        let isSupportedLanguage = includes(this.supportedLanguages, language);

        // If no exact match is found, search without the region
        if (language && !isSupportedLanguage) {
            language = language.split('-')[0];
            language = this.supportedLanguages.find(supportedLanguage => supportedLanguage.startsWith(language)) || '';
            isSupportedLanguage = Boolean(language);
        }

        // Fallback if language is not supported
        if (!isSupportedLanguage) {
            language = this.defaultLanguage;
        }

        moment.locale(language);
        this.translateService.use(language);
        this.translateService.setDefaultLang(language);
    }

    get language(): string {
        return this.translateService.currentLang;
    }
}

