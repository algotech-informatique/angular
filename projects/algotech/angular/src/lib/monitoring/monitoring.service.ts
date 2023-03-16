import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, flatMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { ProcessMonitoringSearchDto, ProcessMonitoringDto } from '@algotech/core';
import { AuthService } from '../auth/auth.service';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import { EnvService } from '../base/env.service';

@Injectable()
export class MonitoringService extends BaseCacheService<ProcessMonitoringDto> {

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService,
    ) {
        super(dataService, authService, http, env);
        this.prefix = 'so';
        this.serviceUrl = '/monitoring';
    }


    getAllProcesses(skip: number, limit: number, filter: ProcessMonitoringSearchDto): Observable<ProcessMonitoringDto[]> {
        const url = `${this.api}${this.serviceUrl}${this.buildQueryRoute([
            { key: 'skip', value: skip },
            { key: 'limit', value: limit }])}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<ProcessMonitoringDto[]>(url, filter, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getAllProcesses(skip, limit, filter), error))
            );
    }

    getImportSosProcesses(skip: number, limit: number, filter: ProcessMonitoringSearchDto): Observable<ProcessMonitoringDto[]> {
        const url = `${this.api}${this.serviceUrl}/import/so${this.buildQueryRoute([
            { key: 'skip', value: skip },
            { key: 'limit', value: limit }])}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<ProcessMonitoringDto[]>(url, filter, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getImportSosProcesses(skip, limit, filter), error))
            );
    }

    getImportDocProcesses(skip: number, limit: number, filter: ProcessMonitoringSearchDto): Observable<ProcessMonitoringDto[]> {
        const url = `${this.api}${this.serviceUrl}/import/doc${this.buildQueryRoute([
            { key: 'skip', value: skip },
            { key: 'limit', value: limit }])}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<ProcessMonitoringDto[]>(url, filter, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getImportDocProcesses(skip, limit, filter), error))
            );
    }

    getImportI18nProcesses(skip: number, limit: number, filter: ProcessMonitoringSearchDto): Observable<ProcessMonitoringDto[]> {
        const url = `${this.api}${this.serviceUrl}/import/i18n${this.buildQueryRoute([
            { key: 'skip', value: skip },
            { key: 'limit', value: limit }])}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<ProcessMonitoringDto[]>(url, filter, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getImportI18nProcesses(skip, limit, filter), error))
            );
    }

    getIndexationSosProcesses(skip: number, limit: number, filter: ProcessMonitoringSearchDto): Observable<ProcessMonitoringDto[]> {
        const url = `${this.api}${this.serviceUrl}/indexation/so${this.buildQueryRoute([
            { key: 'skip', value: skip },
            { key: 'limit', value: limit }])}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<ProcessMonitoringDto[]>(url, filter, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getIndexationSosProcesses(skip, limit, filter), error))
            );
    }

    getIndexationDocProcesses(skip: number, limit: number, filter: ProcessMonitoringSearchDto): Observable<ProcessMonitoringDto[]> {
        const url = `${this.api}${this.serviceUrl}/indexation/doc${this.buildQueryRoute([
            { key: 'skip', value: skip },
            { key: 'limit', value: limit }])}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<ProcessMonitoringDto[]>(url, filter, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getIndexationDocProcesses(skip, limit, filter), error))
            );
    }

    getDeleteSosProcesses(skip: number, limit: number, filter: ProcessMonitoringSearchDto): Observable<ProcessMonitoringDto[]> {
        const url = `${this.api}${this.serviceUrl}/delete/so${this.buildQueryRoute([
            { key: 'skip', value: skip },
            { key: 'limit', value: limit }])}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<ProcessMonitoringDto[]>(url, filter, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getDeleteSosProcesses(skip, limit, filter), error))
            );
    }

}

