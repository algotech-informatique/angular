import { Injectable, Inject } from '@angular/core';
import { BaseService } from '../base/base.service';
import { DomainDto } from '@algotech-ce/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { EnvService } from '../base/env.service';

@Injectable()
export class DomainsService extends BaseService<DomainDto> {

    constructor(
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService) {
        super(authService, http, env);
        this.serviceUrl = '/domains';
    }

}
