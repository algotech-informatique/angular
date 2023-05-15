import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SettingsDto, PairDto } from '@algotech-ce/core';
import { AuthService } from '../auth/auth.service';
import { flatMap } from 'rxjs/operators';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import { EnvService } from '../base/env.service';

@Injectable()
export class SettingsService extends BaseCacheService<SettingsDto> {

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        super(dataService, authService, http, env);
        this.keyName = '';
        this.prefix = 'settings';
        this.serviceUrl = '/settings';
    }

    public getSettings(params?: PairDto[]): Observable<SettingsDto> {
        return this.getCache<SettingsDto>(
            (() => {
                return this.obsHeaders()
                    .pipe(
                        flatMap((headers: HttpHeaders) =>
                        this.http.get<SettingsDto>(`${this.api}${this.serviceUrl}${this.buildQueryRoute(params)}`, { headers })),
                        catchError((error: HttpErrorResponse) => this.handleError(this.getSettings(), error))
                    );
            }),
            ''
        );
    }

    public getSettingsApp(appName: string): Observable<any> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<any>(`${this.api}${this.serviceUrl}/${appName}`, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getSettingsApp(appName), error))
            );
    }
}
