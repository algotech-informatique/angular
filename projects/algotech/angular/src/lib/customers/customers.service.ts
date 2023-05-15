import { Injectable, Inject } from '@angular/core';
import { BaseService } from '../base/base.service';
import { CustomerDto } from '@algotech-ce/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { flatMap, catchError } from 'rxjs/operators';
import { EnvService } from '../base/env.service';

@Injectable()
export class CustomersService extends BaseService<CustomerDto> {

    constructor(protected authService: AuthService, protected http: HttpClient, protected env: EnvService) {
        super(authService, http, env);
        this.serviceUrl = '/customers';
    }

    public getByCustomerKey(): Observable<CustomerDto> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<CustomerDto>(`${this.api}${this.serviceUrl}/self`, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getByCustomerKey(), error))
            );
    }
}
