import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from '../base/env.service';
import * as _ from 'lodash';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import { AuthService } from '../auth/auth.service';
import { Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

@Injectable()
export class I18nImportService extends BaseCacheService<any> {

    defaultLanguage: string;
    supportedLanguages: string[];

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService,
    ) {
        super(dataService, authService, http, env);
        this.serviceUrl = '/i18n'; 
    }

    public exportI18nFile(download: boolean): Observable<boolean> {
        const token = this.authService.localProfil.key;
        const link = `${this.api}/i18n/export?jwt=${token}`;
        try {
            if (download) {
                window.location.href = link;
            } else {
                window.open(link);
            }
            return of(true);
        } catch (err) {
            return of(false);
        }
        
    }
    
    public importI18nFile(file: File): Observable<boolean> {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);

        return this.obsHeaders().pipe(
            flatMap((headers: HttpHeaders) => {
                let newHeaders = _.cloneDeep(headers);
                newHeaders = newHeaders.delete('Content-Type');
                newHeaders = newHeaders.delete('Accept');
                return this.http.post<boolean>(`${this.api}${this.serviceUrl}/import`, formData, { headers: newHeaders });
            }),
        );
    }
}

