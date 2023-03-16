import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { flatMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { EMailDto } from '@algotech/core';
import { BaseService } from '../base/base.service';
import { EnvService } from '../base/env.service';


@Injectable()
export class EmailService extends BaseService<EMailDto> {

    constructor(protected authService: AuthService, protected http: HttpClient, protected env: EnvService) {
        super(authService, http, env);
        this.serviceUrl = '/email';
    }

    sendMail(email: EMailDto) {

        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) =>
                    this.http.post<EMailDto>(`${this.api}${this.serviceUrl}/`, email, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.sendMail(email), error))
            );
    }

}
