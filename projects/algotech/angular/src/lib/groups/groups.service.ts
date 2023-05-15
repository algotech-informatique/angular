import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GroupDto } from '@algotech-ce/core';
import { AuthService } from '../auth/auth.service';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import { EnvService } from '../base/env.service';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class GroupsService extends BaseCacheService<GroupDto> {

    constructor(
        protected dataService:  DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        super(dataService, authService, http, env);
        this.prefix = 'grp';
        this.keyName = 'key';
        this.serviceUrl = '/groups';
    }
    public updateCache(): Observable<any> {
        return this.dataService.saveAll<GroupDto>(super.rootList(), this.prefix, this.keyName);
    }
}
