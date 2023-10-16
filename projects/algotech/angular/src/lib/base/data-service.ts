import { Injectable } from '@angular/core';
import { flatMap, map, mergeMap, tap } from 'rxjs/operators';
import { Observable, from, of, zip, throwError, defer } from 'rxjs';
import * as _ from 'lodash';
import { Storage } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { AuthService } from '../auth/auth.service';
import { NetworkService } from './network.service';
import { EnvService } from './env.service';

@Injectable()
export class DataService {

    public mobile = false;
    public storage: Storage = null;
    public keys: string[] = [];

    private storageContext: string;
    private objects: Object = {};

    constructor(
        public networkService: NetworkService,
        private authService: AuthService,
        protected env: EnvService
    ) {
        const deviceAgent = navigator.userAgent.toLowerCase();
        this.mobile = !!(deviceAgent.match(/(iphone|ipod|ipad)/) ||
            deviceAgent.match(/(android)/) ||
            deviceAgent.match(/(iemobile)/) ||
            deviceAgent.match(/iphone/i) ||
            deviceAgent.match(/ipad/i) ||
            deviceAgent.match(/ipod/i) ||
            deviceAgent.match(/blackberry/i) ||
            deviceAgent.match(/bada/i));

        env.environment.subscribe((e) => this.storageContext = e.STORAGE_CONTEXT);
    }

    get active() {
        return !!this.storage;
    }

    isCollection(prefix: string): boolean {
        return prefix?.startsWith('$');
    }

    Initialize(): Observable<Storage> {
        return new Observable<Storage>((observer) => {
            this.storage = null;
            if (!this.authService.isAuthenticated) {
                observer.error(new Error('cannot initialize storage if not authenticated'));
                observer.complete();
            }
            if (!this.storageContext) {
                observer.error(new Error('cannot initialize storage if not have storage context'));
                observer.complete();
            }
            this.storage = new Storage({
                name: `visiondb_${this.authService.localProfil.login}_${this.storageContext}`,
                storeName: 'keyvaluepairs',
                driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
            });
            this.authService.storage = this.storage;
            this.storage.create().then((res) => {
                this.storage.keys().then((keys: string[]) => {
                    this.keys = keys;
                    observer.next(res);
                    observer.complete();
                })
            });
        });
    }

    public getAll<T>(prefix: string): Observable<T[]> {
        if (this.isCollection(prefix)) {
            return this.getItem(prefix).pipe(
                map((collection: Object) => {
                    if (!collection) {
                        return [];
                    }
                    return Object.values(collection);
                })
            )
        } else {
            const keys = _.filter(this.keys, (key) => key.startsWith(`${prefix}-`));
            const data$ = _.map(keys, (key: string) => {
                return this.getItem(key);
            });
            return data$.length > 0 ? zip(...data$) as Observable<T[]> : of([]);
        }
    }

    public saveAll<T>(get: Observable<T[]>, prefix: string, keyName: string): Observable<T[]> {
        return get.pipe(
            mergeMap((res: T[]) => {
                if (this.active) {
                    if (this.isCollection(prefix)) {
                        return this.getItem(prefix).pipe(
                            mergeMap((collection: Object) => {
                                if (!collection) {
                                    collection = {};
                                }
                                for (const item of res) {
                                    collection[item[keyName]] = item;
                                }
                                return this.setItem(prefix, collection).pipe(
                                    map(() => res)
                                );
                            })
                        )
                    } else {
                        const save$ = _.map((res), (item: T) => this.save(item, prefix, item[keyName]));
                        return save$.length > 0 ? zip(...save$) as Observable<T[]> : of([]);
                    }
                }
                return of(res);
            })
        );
    }

    public get<T>(prefix: string, id: string): Observable<T> {
        if (this.isCollection(prefix)) {
            return this.getItem(`${prefix}`).pipe(
                map((collection) => {
                    if (!collection) {
                        return null;
                    }
                    return collection[id];
                })
            );
        } else {
            return this.getItem(`${prefix}-${id}`);
        }
    }

    public save<T>(object: T, prefix: string, id: string, insertNew = true) {
        if (this.isCollection(prefix)) {
            return this.getItem(prefix).pipe(
                mergeMap((collection: Object) => {
                    if (!collection) {
                        collection = {};
                    }
                    if (_.isEqual(collection[id], object)) {
                        return of(object);
                    }
                    collection[id] = object;
                    return this.setItem(prefix, collection).pipe(
                        map(() => object)
                    );
                }));
        } else {
            return (insertNew ? of(true) : this.get(prefix, id).pipe(map((ele) => !!ele))).pipe(
                flatMap((save: boolean) => {
                    if (save) {
                        return from(this.setItem(`${prefix}-${id}`, object));
                    }
                    return of({});
                })
            );
        }
    }

    public remove(prefix: string, id: string): Observable<any> {
        if (this.isCollection(prefix)) {
            return throwError(new Error('collection cannot remove at the root level.'));
        }
        return this.removeItem(`${prefix}-${id}`);
    }

    public saveExtras(key: string, extras: any) {
        if (!this.active) {
            return of({});
        }
        return this.setItem(key, extras);
    }

    public getExtras(key: string) {
        return this.getItem(key);
    }

    // storage actions
    public clear(): Observable<any> {
        this.keys = [];
        this.objects = {};
        
        return from(this.storage.clear());
    }

    public removeItem(key: string): Observable<any> {
        this.keys.splice(this.keys.indexOf(key), 1);
        return from(this.storage.remove(key));
    }

    public getItem(key: string): Observable<any> {
        return defer(() => {
            if (this.objects[key]) {
                return of(this.objects[key]);
            }
            return from(this.storage.get(key)).pipe(
                map((object) => {
                    this.setLocal(key, object);
                    return object;
                })
            );
        })
    }

    public setItem(key: string, object: any): Observable<any> {
        this.setLocal(key, object);
        return from(this.storage.set(key, object));
    }

    private setLocal(key: string, object: any) {
        if (this.keys.indexOf(key) === -1) {
            this.keys.push(key);
        }
        if (this.isCollection(key)) {
            this.objects[key] = object;
        }
    }
}
