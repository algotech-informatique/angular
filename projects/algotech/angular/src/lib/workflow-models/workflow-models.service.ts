import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WorkflowModelDto, PairDto } from '@algotech/core';
import { AuthService } from '../auth/auth.service';
import { flatMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import { EnvService } from '../base/env.service';

@Injectable()
export class WorkflowModelsService extends BaseCacheService<WorkflowModelDto> {

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        // super(config, http, localStorage);
        super(dataService, authService, http, env);
        this.keyName = 'key';
        this.prefix = 'wfm';
        this.serviceUrl = '/workflow-models';
    }

    public getByKey(key: string, params?: PairDto[]): Observable<WorkflowModelDto> {
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
                    return this.http.get<WorkflowModelDto>(`${this.api}${this.serviceUrl}/key/${key}${routeParams}`, { headers });
                }),
                catchError((error: HttpErrorResponse) => this.handleError(this.getByKey(key), error))
            );
    }

    public getBySmartnodes(snModelUuid: string): Observable<WorkflowModelDto> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<WorkflowModelDto>(`${this.api}${this.serviceUrl}/smartnodes/${snModelUuid}`,
                    { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getBySmartnodes(snModelUuid), error))
            );
    }

}
