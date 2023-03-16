import { Injectable, Inject } from '@angular/core';
import { ScheduleDto, ScheduleSearchDto, PairDto } from '@algotech/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { flatMap, map, catchError } from 'rxjs/operators';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import * as _ from 'lodash';
import moment from 'moment';
import { EnvService } from '../base/env.service';

@Injectable()
export class ScheduleService extends BaseCacheService<ScheduleDto> {

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService) {

        super(dataService, authService, http, env);
        this.prefix = 'schedule';
        this.serviceUrl = '/scheduler';
    }

    public search(searchDto: ScheduleSearchDto, params?: PairDto[]): Observable<ScheduleDto[]> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) =>
                    this.http.post<ScheduleDto[]>(`${this.api}${this.serviceUrl}/search${this.buildQueryRoute(params)}`,
                        searchDto, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.search(searchDto), error))
            );
    }

    public get<T>(id: string, params?: PairDto[]): Observable<T> {
        const body = {
            uuid: [
                id
            ]
        };
        const newParams = params ? [...params] : [];
        newParams.push(...[{ key: 'skip', value: 0 }, { key: 'limit', value: 1 }]);

        return this.getCache(
            (_params: PairDto[]) => {
                return this.obsHeaders()
                    .pipe(
                        flatMap((headers: HttpHeaders) =>
                            this.http.post<ScheduleDto[]>(`${this.api}${this.serviceUrl}/search${this.buildQueryRoute(_params)}`,
                                body, { headers })),
                        catchError((error: HttpErrorResponse) => this.handleError(this.get(id, _params), error)),
                        map((d) => {
                            return d.length === 1 ? d[0] : null;
                        }),
                    );
            },
            id,
            newParams,
        );
    }

    public getBetween(
        dateDebut,
        dateEnd,
        options: {
            beginPlannedDate?: boolean,
            endPlannedDate?: boolean,
            assignedUserUuid?: boolean
        } = {
                beginPlannedDate: true,
            }): Observable<ScheduleDto[]> {

        const body: any = {};

        if (options.beginPlannedDate) {
            body.beginPlannedDate = [{
                start: dateDebut,
                end: dateEnd
            }];
        }

        if (options.endPlannedDate) {
            body.endPlannedDate = [{
                start: dateDebut,
                end: dateEnd
            }];
        }

        if (options.assignedUserUuid) {
            body.assignedUserUuid = [this.authService.localProfil.id];
        }

        const params = [{ key: 'skip', value: 0 }, { key: 'limit', value: 1000 }];

        if (!this.dataService.networkService.offline) {
            return this.dataService.saveAll(
                this.obsHeaders()
                    .pipe(
                        flatMap((headers: HttpHeaders) =>
                            this.http.post<ScheduleDto[]>(
                                `${this.api}${this.serviceUrl}/search${this.buildQueryRoute(params)}`, body, { headers })),
                        catchError((error: HttpErrorResponse) => this.handleError(this.getBetween(dateDebut, dateEnd), error))
                    ),
                this.prefix,
                this.keyName
            );
        } else {
            return this.dataService.getAll(this.prefix).pipe(
                map((schedules: ScheduleDto[]) => {
                    return _.filter(schedules, (schedule: ScheduleDto) => {
                        if (options.beginPlannedDate) {
                            if (!moment(schedule.beginPlannedDate).isBetween(dateDebut, dateEnd)) {
                                return false;
                            }
                        }

                        if (options.endPlannedDate) {
                            if (!moment(schedule.endPlannedDate).isBetween(dateDebut, dateEnd)) {
                                return false;
                            }
                        }

                        if (options.assignedUserUuid) {
                            if (schedule.assignedUserUuid.indexOf(this.authService.localProfil.id) === -1) {
                                return false;
                            }
                        }

                        return true;
                    });
                })
            );
        }
    }

    public patch<T>(uuid: string, body: any): Observable<T> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.patch<T>(`${this.api}${this.serviceUrl}/${uuid}`, body, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.patch(uuid, body), error))
            );
    }
}
