import { PairDto, SmartTaskDto, SmartTaskLogDto, SmartTaskPeriodicityDto, UserDto } from '@algotech-ce/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../base/base.service';
import { EnvService } from '../base/env.service';
import { SettingsDataService } from '../settings/settings-data.service';
import { catchError, flatMap, mergeMap } from 'rxjs/operators';
import { Observable, zip } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';

@Injectable()
export class SmartTasksService extends BaseService<SmartTaskDto> {

    constructor(
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService,
        protected settingsDataService: SettingsDataService,
        protected translateService: TranslateService,
    ) {
        super(authService, http, env);
        this.serviceUrl = '/smart-tasks';
    }

    createNewSmartTaskPasswordModify(user: UserDto, days: number): Observable<SmartTaskDto[]> {

        const userName = user.username;
        const inputs: PairDto[] = this._taskInputs(user, days);
         // Mail
        const mailPeriodicity = this._getNotificationDates(days, 7, 3, 'days');
        const dateMail = mailPeriodicity.dateRange.start;
        const taskMail: SmartTaskDto = this._createNewTask('mail', `task_mail_${userName}`,
            `task_mail_${userName}_${dateMail}`, mailPeriodicity, inputs, user.uuid);

        // Notify
        const notifyPeriodicity = this._getNotificationDates(days, 3, 1, 'days');
        const dateNotify = mailPeriodicity.dateRange.start;
        const taskNotify: SmartTaskDto = this._createNewTask('notify', `task_notify_${userName}`,
            `task_notify_${userName}_${dateNotify}`, notifyPeriodicity, inputs, user.uuid);

        return zip(
            this._createTask(taskMail),
            this._createTask(taskNotify)
        );
    }

    getSmartTaskLogs(smartTaksUuid: string): Observable<SmartTaskLogDto[]> {
        return this.obsHeaders().pipe(
            flatMap((headers: HttpHeaders) => {
                return this.http.get(`${this.api}${this.serviceUrl}/logs/${smartTaksUuid}`, { headers });
            }),
            catchError((error: HttpErrorResponse) =>
                this.handleError(this.getSmartTaskLogs(smartTaksUuid), error))
        );
    }

    delete(uuid: string): Observable<{}> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.delete<boolean>(`${this.api}${this.serviceUrl}/${uuid}`, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.delete(uuid), error))
            );
    }

    deleteByFlowKey(flowKey: string): Observable<{}> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) =>
                    this.http.delete<boolean>(`${this.api}${this.serviceUrl}/deleteByFlowKey/${flowKey}`, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.deleteByFlowKey(flowKey), error))
            );
    }

    getByUuid(uuid: string): Observable<SmartTaskDto> {
        return this.obsHeaders()
            .pipe(
                mergeMap((headers: HttpHeaders) => this.http.get(`${this.api}${this.serviceUrl}/${uuid}`, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getByUuid(uuid), error))
            );
    }

    private _getNotificationDates(days: number, firstNotif: number,
        frequency: number, repeat: 'days' | 'months' | 'hours'): SmartTaskPeriodicityDto {

        const currentDate = moment();
        const endDate = moment(currentDate).add(days, 'days');
        const startDate = moment(endDate).add(-firstNotif, 'days');

        const notif: SmartTaskPeriodicityDto = {
            repeatEvery: [
                {
                    repeatType: repeat,
                    frequency: frequency,
                }
            ],
            dateRange: {
                start: moment(startDate).format('YYYY-MM-DDTHH:mm:ss'),
                end: moment(endDate).format('YYYY-MM-DDTHH:mm:ss'),
            },
            skipImmediate: true,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        return notif;
    }

    private _createNewTask(type: 'mail' | 'notify', key: string, name: string,
        periodicity: SmartTaskPeriodicityDto, data: PairDto[], userUuid: string ) {

        const smartTaskDto: SmartTaskDto = {
            enabled: true,
            flowType: type,
            flowKey: key,
            name: name,
            periodicity: periodicity,
            priority: 'normal',
            userUuid: userUuid,
            inputs: data,
        };
        return smartTaskDto;
    }

    private _createTask(smartTaskDto: SmartTaskDto): Observable<SmartTaskDto> {
        return this.obsHeaders().pipe(
            flatMap((headers: HttpHeaders) => {
                return this.http.post(`${this.api}${this.serviceUrl}`, smartTaskDto, { headers });
            }),
            catchError((error: HttpErrorResponse) =>
                this.handleError(this._createTask(smartTaskDto), error))
        );
    }

    private _taskInputs(user: UserDto, days: number) {

        const currentDate = moment();
        const endDate = moment(currentDate).add(days, 'days');
        const lastDate = moment(endDate).format('DD/MM/YYYY');
        const data: PairDto[] = [
            {
                key: 'url',
                value: window.location.origin.replace('localhost', '127.0.0.1'),
            },
            {
                key: 'user',
                value: user.username,
            },
            {
                key: 'title',
                value: this.translateService.instant('PAGE.RESET_PASSWORD'),
            },
            {
                key: 'body',
                value: this.translateService.instant('ASSIGN_PASSWORD.SEND_CHANGE_PASSWORD', {key: lastDate }),
            }
        ];
        return data;
    }
}
