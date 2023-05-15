import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, zip } from 'rxjs';
import { catchError, flatMap, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { DocumentDto, PairDto, SmartObjectDto } from '@algotech-ce/core';
import { AuthService } from '../auth/auth.service';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import { EnvService } from '../base/env.service';

@Injectable()
export class ConvertService extends BaseCacheService<any> {

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        super(dataService, authService, http, env);
    }

    /* public uploadFile(file: File, fileName?: string) {
        const formData: FormData = new FormData();
        if (file && fileName) {
            formData.append('file', file, fileName);
        }

        const url = `${this.api}/convert/docxtopdf`;
        return this.obsHeaders().pipe(
            flatMap((headers: HttpHeaders) => {
                let newHeaders = _.cloneDeep(headers);
                newHeaders = newHeaders.delete('Content-Type');
                newHeaders = newHeaders.delete('Accept');
                return this.http.post(url, formData,
                    {
                        headers: newHeaders,
                        responseType: 'blob',
                    },
                );
            }),
            catchError((error: HttpErrorResponse) => this.handleError(this.uploadFile(file, fileName), error))
        );

    } */

    public convertFile(versionId: string) {

        const url = `${this.api}/convert/docxtopdf/${versionId}`;
        return this.obsHeaders().pipe(
            flatMap((headers: HttpHeaders) => {
                const newHeaders = _.cloneDeep(headers);
                return this.http.get(url,
                    {
                        headers: newHeaders,
                        responseType: 'blob',
                    },
                );
            }),
            catchError((error: HttpErrorResponse) => this.handleError(this.convertFile(versionId), error))
        );

    }

    public convertFileWithFile(file: File, fileName: string) {
        const url = `${this.api}/convert/docxtopdf`;
        const formData: FormData = new FormData();
        formData.append('file', file, fileName);
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    let newHeaders = _.cloneDeep(headers);
                    newHeaders = newHeaders.delete('Content-Type');
                    newHeaders = newHeaders.delete('Accept');

                    return this.http.post(url, formData,
                        {
                            headers: newHeaders,
                            responseType: 'blob',
                        },
                    );
                }),
                catchError((error: HttpErrorResponse) => this.handleError(this.convertFileWithFile(file, fileName), error))
            );
    }

}

