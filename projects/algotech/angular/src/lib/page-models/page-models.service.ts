import { PairDto, PageModelDto } from '@algotech/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, flatMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../base/base.service';
import { DataService } from '../base/data-service';
import { EnvService } from '../base/env.service';
import * as _ from 'lodash';

@Injectable()
export class PageModelsService extends BaseService<PageModelDto> {

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        super(authService, http, env);
        this.serviceUrl = '/page-models';
    }

    public getByKey(key: string, params?: PairDto[]): Observable<PageModelDto> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    const routeParams = params ?
                        _.reduce(params, (result, param) => {
                            result = result === '' ? '?' : `${result}&`;
                            result = `${result}${param.key}=${param.value}`;
                            return result;
                        }, '')
                        : '';
                    return this.http.get<PageModelDto>(`${this.api}${this.serviceUrl}/key/${key}${routeParams}`, { headers });
                }),
                catchError((error: HttpErrorResponse) => this.handleError(this.getByKey(key), error))
            );
    }

    public getBySmartnodes(snModelUuid: string): Observable<PageModelDto> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<PageModelDto>(`${this.api}${this.serviceUrl}/smartnodes/${snModelUuid}`,
                    { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getBySmartnodes(snModelUuid), error))
        );
    }

}
