import { Injectable, Inject } from '@angular/core';
import { BaseService } from '../base/base.service';
import { HttpClient } from '@angular/common/http';
import { SmartModelConfig } from '@algotech-ce/core';
import { AuthService } from '../auth/auth.service';
import { EnvService } from '../base/env.service';

@Injectable()
export class ModelerService extends BaseService<SmartModelConfig> {

    constructor(
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService, ) {
        super(authService, http, env);
        this.serviceUrl = '/modeler/config';
    }
}
