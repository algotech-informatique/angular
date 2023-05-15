import { BaseService } from './base.service';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { PairDto, BaseModel, CacheDto } from '@algotech-ce/core';
import { Observable, of, throwError, zip } from 'rxjs';
import { flatMap, catchError, map, mergeMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DataService } from './data-service';
import { CacheNotFindError } from './base.cache.error';
import { EnvService } from './env.service';

@Injectable()
export abstract class BaseCacheService<T> extends BaseService<T> {
    protected prefix = null;
    protected keyName = 'uuid';

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService) {
        super(authService, http, env);
    }

    public updateCache(insertNew = false): Observable<any> {
        return this.dataService.get('cache', 'date').pipe(
            flatMap((date: Date) => {
                // initialize (first time)
                if (!date) {
                    if (!insertNew) {
                        return of({});
                    }
                    return this.dataService.saveAll<T>(super.list(), this.prefix, this.keyName);
                }
                return this.cache(date, insertNew);
            })
        );
    }

    private cache(date: Date, insertNew: boolean, firstAttempt = true) {
        // update cache
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    // DEFINE ACTION FLATMAP AFTER RQ
                    // add and delete object
                    const action = mergeMap((cache: CacheDto) => {
                        if (cache.deleted.length === 0 && cache.updated.length === 0) {
                            return of(null);
                        }
                        if (this.dataService.isCollection(this.prefix)) {
                            return this.dataService.getItem(this.prefix).pipe(
                                mergeMap((collection: Object) => {
                                    if (!collection) {
                                        collection = {};
                                    }
                                    for (const ele of cache.updated) {
                                        if (!!collection[ele[this.keyName]]) {
                                            collection[ele[this.keyName]] = ele;
                                        }
                                    }
                                    for (const uuid of cache.deleted) {
                                        delete collection[uuid];
                                    }
                                    return this.dataService.setItem(this.prefix, collection);
                                }),
                            );
                        } else {
                            const save$ = cache.updated.length === 0 ? of([]) :
                                zip(...cache.updated.map((ele: T) => this.dataService.save(ele, this.prefix, ele[this.keyName], insertNew)));
                            const delete$ = cache.deleted.length === 0 ? of([]) :
                                zip(...cache.deleted.map((uuid: string) => this.dataService.remove(this.prefix, uuid)));

                            return zip(
                                save$,
                                delete$
                            );
                        }
                    });

                    // FIRST ATTEMPT
                    if (firstAttempt) {
                        return this.http.get<CacheDto>(`${this.api}${this.serviceUrl}/cache/${date.toISOString()}`, { headers }).pipe(
                            action,
                        );
                    }

                    // SECOND ATTEMPT
                    // chunk with uuid
                    const CHUNK = 250;
                    return this.dataService.getAll<any>(this.prefix).pipe(
                        map((objects: T[]) => {
                            return _.chunk(objects, CHUNK).map((array: any[]) => {
                                return {
                                    uuid: array.map((item) => {
                                        return item.uuid;
                                    })
                                };
                            });
                        }),
                        flatMap((chunk: { uuid: string[] }[]) => {
                            const rq$ = chunk.map((body: { uuid: string[] }) =>
                                this.http.post<CacheDto>(`${this.api}${this.serviceUrl}/cache/${date.toISOString()}`, body, { headers })
                                    .pipe(action)
                            );
                            return rq$.length === 0 ? of([]) : zip(...rq$);
                        })
                    );
                }),
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 400 && firstAttempt) {
                        // SECOND ATTEMPT
                        return this.cache(date, insertNew, false);
                    }
                    return throwError(error);
                }),
            );
    }

    public list(params?: PairDto[]): Observable<T[]> {
        if (!this.dataService.active) {
            return super.list(params);
        }

        if (!this.prefix || !this.keyName) {
            throw new Error('prefix or keyname is invalid');
        }

        return (this.dataService.networkService.offline ? of({}) : this.updateCache(true)).pipe(
            flatMap(() => this.dataService.getAll<T>(this.prefix)
            ));
    }

    protected rootList(params?: PairDto[]): Observable<T[]> {
        return super.list(params);
    }

    public get(id: string, params?: PairDto[]): Observable<T> {
        return this.getCache<T>(
            (_params?: PairDto[]) => super.get(id, _params),
            id,
            params
        );
    }

    private _findExtra(extras: any, params: PairDto[]) {
        return extras.find((e) => {
            const compare: PairDto[] = e.params;
            return params.length === compare.length && params.every((pairCompare: PairDto) => {
                return compare.some((pairParams) => {
                    if (pairParams.key !== pairCompare.key) {
                        return false;
                    }

                    if (pairParams.key === 'current-user') {
                        return pairParams.value?.credentials?.login === pairCompare.value?.credentials?.login;
                    }

                    return _.isEqual(pairParams.value, pairCompare.value)
                });
            })
        });
    }

    public saveRoute(route: string, params: PairDto[], value: any) {
        return this.dataService.getExtras(route).pipe(
            map((res) => {
                let extras = res;
                if (!extras) {
                    extras = [];
                }
                const extra = this._findExtra(extras, params);
                if (extra) {
                    extra.value = value;
                } else {
                    extras.push({
                        params,
                        value,
                    });
                }
                return extras;
            }),
            mergeMap((extras) => this.dataService.saveExtras(route, extras)),
        );
    }

    public getRoute(route: string, params: PairDto[]): Observable<any> {
        return this.dataService.getExtras(route).pipe(
            map((extras: any) => {
                if (!extras) {
                    throw new CacheNotFindError(`${route} not find on cache`);
                }
                const extra = this._findExtra(extras, params);
                if (!extra || !extra.value) {
                    throw new CacheNotFindError(`${route} not find on cache`);
                }
                return extra.value;
            }));
    }

    protected getCache<T>(getCallback: (params?: PairDto[]) => Observable<T>, id: string, params?: PairDto[]): Observable<T> {
        if (!this.dataService.active) {
            return getCallback(params);
        }

        if (!this.prefix) {
            throw new Error('prefix is invalid');
        }

        return this.dataService.get<T>(this.prefix, id).pipe(
            flatMap((data: T) => {
                // offline
                if (this.dataService.networkService.offline) {
                    if (!data) {
                        throw new CacheNotFindError(`${this.prefix} ${id} not find on cache`);
                    }
                    return of(data);
                }

                // online
                const newParams: PairDto[] = params ? [...params] : [];
                if (data && (data as BaseModel).updateDate) {
                    newParams.push({ key: 'date', value: (data as BaseModel).updateDate });
                }

                return (getCallback(newParams) as Observable<T>).pipe(
                    catchError((e) => {
                        if (e.status === 304) {
                            return of(data);
                        }
                        return throwError(e);
                    }),
                    flatMap((data: T | Error) => {
                        if (!(data instanceof Error)) {
                            const key = this.keyName !== '' ? data[this.keyName] : '';
                            return this.dataService.save<T>(data, this.prefix, key);
                        }
                        return of(data);
                    }),
                );
            })
        );
    }

    protected handleError(req: Observable<any>, error: HttpErrorResponse): Observable<any> {
        if (error.status === 0) {
            if (this.dataService.mobile) {
                this.dataService.networkService.setOffline();

                return req;
            }
        }
        return super.handleError(req, error);
    }
}
