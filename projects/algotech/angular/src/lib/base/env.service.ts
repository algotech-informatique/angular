import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { LocalProfil } from '../models/local-profil';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class EnvService {
    private _environment: BehaviorSubject<any>;
    private _environments: {
        api: string,
        login: string,
        environment: any,
        localProfil: LocalProfil
    }[] = [];

    constructor(private authService: AuthService) {
    }

    get environment() {
        if (!this._environment) {
            throw new Error('environment not initialized');
        }
        return this._environment;
    }

    public initialize(environment) {
        const api = environment.API_URL;

        this._environment = new BehaviorSubject(environment);
        this.authService.api = api;
    }


    public setEnvironment(environment, localProfil: LocalProfil) {
        const api = environment.API_URL;
        const login = localProfil.login;

        this._remove(api, login);
        this._environments.push({
            api,
            environment,
            login,
            localProfil: this.authService.localProfil
        });

        this.environment.next(environment);
    }

    // use for multi connect
    public disconnect(api: string, login: string) {
        this._remove(api, login);
    }


    public _remove(api: string, login: string): boolean {
        const findEnvIndex = this._environments.findIndex((e) => e.api === api && e.login === login);
        if (findEnvIndex > -1) {
            this._environments.splice(findEnvIndex, 1);
            return true;
        }
        return false;
    }
}
