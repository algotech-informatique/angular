import { Injectable } from '@angular/core';
import { DataService } from '../base/data-service';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpSentEvent } from '@angular/common/http';
import { WorkflowModelDto, WorkflowLaunchOptionsDto, SmartObjectDto, SmartFlowResultDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { Observable, of, throwError, zip } from 'rxjs';
import { flatMap, catchError, map, mergeMap } from 'rxjs/operators';
import { EnvService } from '../base/env.service';
import { BaseCacheService } from '../base/base.cache.service';
import { CacheNotFindError } from '../base/base.cache.error';
import { SmartObjectsService } from '../smart-objects/smart-objects.service';
import { SmartFlowsCacheResult } from './smart-flows-cache-result';

@Injectable()
export class SmartFlowsService extends BaseCacheService<WorkflowModelDto> {

    constructor(
        private smartObjectsService: SmartObjectsService,
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        super(dataService, authService, http, env);
        this.prefix = 'sf';
        this.serviceUrl = '/smartflows';
        this.errorResponse = 'object';
    }

    public getByKey(key: string): Observable<WorkflowModelDto> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<WorkflowModelDto>(`${this.api}${this.serviceUrl}/key/${key}`,
                    { headers })),
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

    public start(launchOptions: WorkflowLaunchOptionsDto): Observable<any | SmartFlowResultDto> {
        const saveInputs = [...(launchOptions.inputs ?? []), {key: 'search-parameters', value: launchOptions.searchParameters}];
        if (this.dataService.networkService.offline) {
            if (!launchOptions.toData) {
                throw new CacheNotFindError(`smartflow not cached`);
            }
            return this.getRoute(`${this.serviceUrl}/startsmartflow/${launchOptions.key}`, saveInputs).pipe(
                mergeMap((data: SmartFlowsCacheResult) => {
                    return (data.smartobjects ? this.smartObjectsService.getSmartObjectsByUuid(data.smartobjects) : of(null)).pipe(
                        map((smartobjects: SmartObjectDto[]) => {
                            const result: SmartFlowResultDto = {
                                data: data.data,
                                type: data.type,
                                smartobjects
                            }
                            return result;
                        })
                    );
                }),
            );
        }

        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    const options: any = { headers };
                    return this.http.post<SmartFlowResultDto | any>(`${this.api}${this.serviceUrl}/startsmartflows`,
                        launchOptions, options);
                }),
                map((data: SmartFlowResultDto | any) => {
                    if (!this.dataService.active) {
                        return data;
                    }
                    const operations$: Observable<any>[] = [];
                    if (launchOptions.toData) {
                        if (data.smartobjects) {
                            operations$.push(this.smartObjectsService.saveAll(of(data.smartobjects)));
                        }
                        const save: SmartFlowsCacheResult = {
                            data: data.data,
                            smartobjects: data.smartobjects ? data.smartobjects.map((so) => so.uuid) : null,
                            type: data.type
                        };
                        operations$.push(this.saveRoute(`${this.serviceUrl}/startsmartflow/${launchOptions.key}`, saveInputs, save));
                    }

                    (operations$.length === 0 ? of([]) : zip(...operations$)).pipe(map(() => data)).subscribe();
                    return data;
                })
            );
    }

    public callApi(callOptions: any) {
        return this.obsHeaders()
            .pipe(
                mergeMap((headers: HttpHeaders) => this.http.post<any>(`${this.api}${this.serviceUrl}/callAPI`, callOptions, { headers })),
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 401) {
                        return throwError(() => error);
                    }
                    return this.handleError(this.callApi(callOptions), error)
                })
            );
    }
}
