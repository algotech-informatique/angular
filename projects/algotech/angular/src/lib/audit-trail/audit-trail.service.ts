import { CustomerDto, Metadata } from '@algotech-ce/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, flatMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../base/base.service';
import { EnvService } from '../base/env.service';

@Injectable()
export class AuditTrailService extends BaseService<Metadata> {

    constructor(
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService,
    ) {
        super(authService, http, env);
        this.serviceUrl = '/audit-trail';
    }

    generate(dateBegin: string, dateEnd: string): Observable<Blob> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post(`${this.api}${this.serviceUrl}/generate`, { dateBegin, dateEnd }, { responseType: 'blob', headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.generate(dateBegin, dateEnd), error))
            );
    }
}
