import { flatMap, catchError } from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { UserDto } from '@algotech-ce/core';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../base/base.service';
import { DataService } from '../base/data-service';
import { EnvService } from '../base/env.service';
import { Observable } from 'rxjs';

@Injectable()
export class UsersService extends BaseService<UserDto> {

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        super(authService, http, env);
        this.serviceUrl = '/users';
        this.errorResponse = 'object';
    }

    public removeMobileToken(uuid: string): Observable<boolean> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<boolean>(`${this.api}${this.serviceUrl}/removeMobileToken`,
                    { uuid }, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.removeMobileToken(uuid), error))
            );
    }

    public assignMobileToken(uuid: string, mobileToken: string): Observable<boolean> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    return this.http.post(`${this.api}${this.serviceUrl}/assignMobileToken`, { uuid, mobileToken }, { headers });
                }),
                catchError((error: HttpErrorResponse) =>
                    this.handleError(this.assignMobileToken(uuid, mobileToken), error))
            );
    }
}
