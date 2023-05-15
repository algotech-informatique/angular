import { ApplicationModelDto, PairDto } from '@algotech-ce/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, flatMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { DataService } from '../base/data-service';
import { EnvService } from '../base/env.service';
import { BaseCacheService } from '../base/base.cache.service';
import * as _ from 'lodash';

@Injectable()
export class ApplicationModelsService extends BaseCacheService<ApplicationModelDto> {

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        super(dataService, authService, http, env);
        this.prefix = 'app';
        this.serviceUrl = '/application-models';
    }

    public getByKey(key: string, params?: PairDto[]): Observable<ApplicationModelDto> {

        return this.obsHeaders().pipe(
            flatMap((headers: HttpHeaders) => {
                const routeParams = params ?
                    _.reduce(params, (result, param) => {
                        result = result === '' ? '?' : `${result}&`;
                        result = `${result}${param.key}=${param.value}`;
                        return result;
                    }, '')
                    : '';
                return this.http.get<ApplicationModelDto>(`${this.api}${this.serviceUrl}/key/${key}${routeParams}`, { headers });
            }),
            catchError((error: HttpErrorResponse) => this.handleError(this.getByKey(key), error))
        );
    }
}
