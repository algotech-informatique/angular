import { EMailDto, UserDto, ValidateUserDto } from '@algotech-ce/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, flatMap } from 'rxjs/operators';
import { BaseService } from '../base/base.service';
import { EnvService } from '../base/env.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthAdminService extends BaseService<UserDto> {

    constructor(
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService) {

        super(authService, http, env);
        this.serviceUrl = '/auth';
    }

    public validateTokenUser(login: string, password: string, endToken: number): Observable<string> {

        const validateUser: ValidateUserDto = {
            login: login,
            password: password,
            endToken: endToken,
        };

        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    return this.http.post(`${this.api}${this.serviceUrl}/validateTokenUser`, validateUser, { headers });
                }),
                catchError((error: HttpErrorResponse) =>
                    this.handleError(this.validateTokenUser(login, password, endToken), error))
        );
    }

    public sendTokenMail(mail: EMailDto): Observable<string> {

        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    return this.http.post(`${this.api}${this.serviceUrl}/sendMailToken`, mail, { headers });
                }),
                catchError((error: HttpErrorResponse) =>
                    this.handleError(this.sendTokenMail(mail), error))
        );
    }
}

