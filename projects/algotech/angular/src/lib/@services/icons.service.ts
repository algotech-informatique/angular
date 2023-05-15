import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { flatMap, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IconDto } from '@algotech-ce/core';
import { BaseService } from '../base/base.service';
import { AuthService } from '../auth/auth.service';
import { EnvService } from '../base/env.service';

@Injectable({
    providedIn: 'root'
})

export class IconsService extends BaseService<IconDto> {

    constructor(protected http: HttpClient,
        protected authService: AuthService,
        protected env: EnvService) {
        super(authService, http, env);
        this.serviceUrl = '/icons';
    }

    getIconByName(name: string): Observable<any> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    return this.http.get(`${this.api}${this.serviceUrl}/read/${name}`, { headers, responseType: 'text' });
                }),
                catchError((error: HttpErrorResponse) => this.handleError(this.getIconByName(name), error))
            );
    }
}
