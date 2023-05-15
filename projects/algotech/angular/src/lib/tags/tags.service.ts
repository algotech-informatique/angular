import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TagListDto } from '@algotech-ce/core';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { flatMap, catchError } from 'rxjs/operators';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import { EnvService } from '../base/env.service';

@Injectable()
export class TagsService extends BaseCacheService<TagListDto> {

    constructor(
        protected authService: AuthService,
        protected dataService: DataService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        super(dataService, authService, http, env);
        this.prefix = 'tag';
        this.keyName = 'key';
        this.serviceUrl = '/tags';
    }

    public getByKey(key: string): Observable<TagListDto> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<TagListDto>(`${this.api}${this.serviceUrl}/key/${key}`, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getByKey(key), error))
            );
    }

}
