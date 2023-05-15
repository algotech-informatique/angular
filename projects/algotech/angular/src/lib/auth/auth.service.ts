import { Injectable } from '@angular/core';
import { from, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { UserDto } from '@algotech-ce/core';
import { LocalProfil } from '../models/local-profil';
import * as _ from 'lodash';
import { KeycloakService, KeycloakEventType } from 'keycloak-angular';
import { Platform } from '@ionic/angular';
import { NetworkService } from '../base/network.service';
import { Storage } from '@ionic/storage';

const LOCAL_PROFIL_KEY = 'localProfil';

export interface UserSigned {
    user: UserDto;
    key: string;
    encryptedPassword: string;
    blockedToken?: string;
}

export interface KeyCloakConfig {
    origin: string;
    url: string;
    realm: string;
    clientId: string;
    redirectUri: string;
}
@Injectable()
export class AuthService {
    appId: string;
    private _api: string = null;
    private _mobile = false;
    storage: Storage;
    currentUser = new Subject<UserDto>();
    loggedIn = new Subject();
    accessToken = new Subject();
    _config: KeyCloakConfig = {
        origin: '',
        url: '',
        realm: '',
        clientId: '',
        redirectUri: '',
    };
    private _subscription: Subscription;
    private _initialized: boolean = false;

    get keycloakService() {
        return this.keycloak;
    }

    get api() {
        if (!this._api) {
            throw new Error('environment not initialized');
        }
        return this._api;
    }

    set api(api) {
        this._api = api;
    }

    get origin() {
        return this._config.origin;
    }

    set redirectUri(url: string) {
        this._config.redirectUri = url;
    }

    constructor(private keycloak: KeycloakService, private platform: Platform, private networkService: NetworkService) {
    }

    public initialize(clientId: string, origin: string, keyCloakurl?: string, mobile = false, realm?: string): Observable<boolean> {
        if (!this._initialized) {
            this._mobile = mobile;
            const originUrl = new URL(origin);
            this._config = {
                origin,
                clientId,
                url: !!keyCloakurl ? keyCloakurl : `${originUrl.origin}/auth`,
                realm: !!realm ? realm : 'vision',
                redirectUri: '',
            }

            this._subscription = this.keycloak.keycloakEvents$.subscribe({
                next: e => {
                    if (e.type == KeycloakEventType.OnTokenExpired) {
                        this.updateToken().subscribe();
                    }
                    if (e.type === KeycloakEventType.OnAuthSuccess) {
                        this.assignLocalProfil();
                    }
                }
            });

            return from(this.keycloak.init({
                config: {
                    url: this._config.url,
                    realm: this._config.realm,
                    clientId: this._config.clientId,
                },
                enableBearerInterceptor: false,
                initOptions: {
                    checkLoginIframe: false,
                    adapter: this.platform.is('cordova') ? 'cordova' : 'default',
                },

            })).pipe(
                map((initialized: boolean) => {
                    this._initialized = initialized;
                    return initialized;
                }),
                mergeMap(() => this.networkService.initialize()),
                mergeMap(() => mobile && !!this.storageLocalProfil ? this.updateToken() : of(null)),
                map(() => this._initialized)
            );
        }
        return of(true);
    }

    public clearToken() {
        if (this._mobile) {
            localStorage.removeItem(LOCAL_PROFIL_KEY);
        }
        if (this.networkService.offline) {
            return;
        }
        this.keycloakService.clearToken();
    }

    public assignLocalProfil() {
        if (this._mobile) {
            localStorage.setItem(LOCAL_PROFIL_KEY, JSON.stringify(this.localProfil));
        }
        this.accessToken.next(this.localProfil.key);
    }

    public updateToken() {
        if (this.networkService.offline) {
            return of(null);
        }
        if (this._mobile && !!this.storageLocalProfil) {
            this.keycloak.getKeycloakInstance().refreshToken = this.storageLocalProfil.refresh;
        }
        return from(this.keycloak.updateToken(20)).pipe(
            tap(() => {
                this.assignLocalProfil();
            }),
            catchError(() => {
                return this.logout(false);
            })
        );
    }

    get localProfil(): LocalProfil | null {
        if (this.networkService.offline) {
            return this.storageLocalProfil;
        }
        const ki: any = this.keycloak.getKeycloakInstance();
        if (ki.authenticated) {
            const user: UserDto = {
                uuid: ki.subject,
                customerKey: ki.realm,
                preferedLang: ki.tokenParsed.locale,
                username: ki.tokenParsed.preferred_username,
                email: ki.tokenParsed.email,
                firstName: ki.tokenParsed.given_name,
                lastName: ki.tokenParsed.family_name,
                groups: ki.tokenParsed.groups,
                following: [],
                favorites: null,
                mobileToken: ki.tokenParsed.mobileToken
            };

            const localProfil: LocalProfil = {
                id: ki.subject,
                key: ki.token,
                refresh: ki.refreshToken,
                login: ki.tokenParsed.preferred_username,
                email: ki.tokenParsed.email,
                firstName: ki.tokenParsed.given_name,
                lastName: ki.tokenParsed.family_name,
                pictureUrl: '',
                preferedLang: ki.tokenParsed.locale,
                groups: ki.tokenParsed.groups,
                password: '',
                user
            }

            return localProfil;
        }
        return null;
    }

    get storageLocalProfil(): LocalProfil {
        const item = localStorage.getItem(LOCAL_PROFIL_KEY);
        if (!item) {
            return null;
        }
        return JSON.parse(item);
    }

    get isAuthenticated(): boolean {
        if (this.networkService.offline) {
            return !!this.storageLocalProfil;
        }
        return this.keycloak.getKeycloakInstance().authenticated;
    }

    private signinProcess(): Observable<any> {
        if (this.isAuthenticated) {
            return of(null);
        }

        // web
        if (!this._mobile) {
            return from(this.keycloakService.login({ redirectUri: this._config.redirectUri }));
        }

        // mobile
        return from(this.keycloakService.login({ redirectUri: this._config.redirectUri, scope: 'openid offline_access' }));
    }

    public signin(): Observable<any> {
        return this.signinProcess();
    }

    public signinAdmin(): Observable<any> {
        return this.signinProcess();
    }

    public accountConsole(): Observable<any> {
        return from(this.keycloak.getKeycloakInstance().accountManagement());
    }

    public adminConsole() {
        window.open(this._config.url + '/admin/master/console/');
    }

    public logout(clearStorage = true): Observable<any> {
        return (!this.storage || !clearStorage ? of(null) : from(this.storage.clear())).pipe(
            mergeMap(() => {
                this.clearToken();
                // Customize credentials invalidation here
                return from(this.keycloakService.logout(null/* TODO add redirectUri */)).pipe(tap(() => this._subscription.unsubscribe()));
            })
        );

    }
}
