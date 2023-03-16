import { flatMap, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { EnvService } from '../base/env.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/base.service';

@Injectable()
export class DatabaseService extends BaseService<any> {

    constructor(
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService,
    ) {
        super(authService, http, env);
        this.serviceUrl = '/database';
    }

    public databaseRequest(connection: any, request: string): Observable<any> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<any>(`${this.api}${this.serviceUrl}`, { connection, request }, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.databaseRequest(connection, request), error))
            );
    }
}
