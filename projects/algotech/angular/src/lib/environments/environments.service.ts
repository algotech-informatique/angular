import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { EnvironmentDto } from '@algotech/core';
import { BaseService } from '../base/base.service';
import { EnvService } from '../base/env.service';
import { Observable } from 'rxjs';
import { flatMap, catchError } from 'rxjs/operators';

@Injectable()
export class EnvironmentsService extends BaseService<EnvironmentDto> {

    constructor(
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService,
    ) {
        super(authService, http, env);
        this.serviceUrl = '/environment';
    }

    public getEnvironment(): Observable<EnvironmentDto> {
        return this.obsHeaders()
        .pipe(
            flatMap((headers: HttpHeaders) =>
                this.http.get<EnvironmentDto>(`${this.api}${this.serviceUrl}${this.buildQueryRoute()}`, { headers })),
            catchError((error: HttpErrorResponse) => this.handleError(this.getEnvironment(), error))
        );
    }
}
