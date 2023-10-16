import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SnModelDto, SnSynoticSearchDto, SnSynoticSearchQueryDto } from '@algotech-ce/core';
import { EnvService } from '../base/env.service';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import { catchError, mergeMap, Observable } from 'rxjs';

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

    public search(query: SnSynoticSearchQueryDto, skip: number, limit: number): Observable<SnSynoticSearchDto[]> {
        return this.obsHeaders()
            .pipe(
                mergeMap((headers: HttpHeaders) => {
                    const params = `skip=${skip}&limit=${limit}`;
                    return this.http.post(`${this.api}${this.serviceUrl}/search?${params}`, query, { headers });
                }),
                catchError((error) => this.handleError(this.references(query, skip, limit), error)
            )
        );
    }

    public references(query: SnSynoticSearchQueryDto, skip: number, limit: number): Observable<SnSynoticSearchDto[]> {
        return this.obsHeaders()
            .pipe(
                mergeMap((headers: HttpHeaders) => {
                    const params = `skip=${skip}&limit=${limit}`;
                    return this.http.post(`${this.api}${this.serviceUrl}/references?${params}`, query, { headers });
                }),
                catchError((error) => this.handleError(this.references(query, skip, limit), error)
            )
            );
    }
}
