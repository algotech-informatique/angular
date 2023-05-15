import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { SnModelDto } from '@algotech-ce/core';
import { BaseService } from '../base/base.service';
import { EnvService } from '../base/env.service';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';

@Injectable()
export class SmartNodesService extends BaseCacheService<SnModelDto> {

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService,
    ) {
        super(dataService, authService, http, env);
        this.prefix = 'snmodels';
        this.keyName = 'uuid';
        this.serviceUrl = '/smartnodes';
    }

}
