import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SmartModelDto } from '@algotech-ce/core';
import { AuthService } from '../auth/auth.service';
import { flatMap } from 'rxjs/operators';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import { EnvService } from '../base/env.service';

@Injectable()
export class SmartModelsService extends BaseCacheService<SmartModelDto> {

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        super(dataService, authService, http, env);
        this.keyName = 'key';
        this.prefix = 'sm';
        this.serviceUrl = '/smart-models';
    }

    public getByKey(key: string, submodel?: boolean): Observable<SmartModelDto|SmartModelDto[]> {
        let route = `${this.api}${this.serviceUrl}/key/${key}`;
        if (submodel) {
            route = `${route}?submodel=1`;
        }
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<SmartModelDto>(route, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getByKey(key), error))
            );
    }

    public getAllSystem(): Observable<SmartModelDto[]> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<SmartModelDto[]>(`${this.api}${this.serviceUrl}/?system=true`, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getAllSystem(), error))
            );
    }
}
