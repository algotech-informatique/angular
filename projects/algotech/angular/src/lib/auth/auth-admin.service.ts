import { EMailDto, ResetPasswordAdminDto, UserDto, ValidateUserDto } from '@algotech/core';
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

    public resetPasswordByAdmin(newPassword: string, sendMail: boolean, userUuid: string): Observable<boolean> {
        const resetPassword: ResetPasswordAdminDto = {
            url:  window.location.origin.replace('localhost', '127.0.0.1'),
            newPassword: newPassword,
            userUuid: userUuid,
            sendMail: sendMail,
        };

        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    return this.http.post(`${this.api}${this.serviceUrl}/resetPasswordAdmin`, resetPassword, { headers });
                }),
                catchError((error: HttpErrorResponse) =>
                    this.handleError(this.resetPasswordByAdmin(newPassword, sendMail, userUuid), error))
        );
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

