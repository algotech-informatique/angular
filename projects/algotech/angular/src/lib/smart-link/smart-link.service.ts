import { EMailDto, SmartLinkDto, PairDto } from '@algotech/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, flatMap, map } from 'rxjs/operators';
import { AuthAdminService } from '../auth/auth-admin.service';
import { AuthService } from '../auth/auth.service';

import moment from 'moment';
import { EnvService } from '../base/env.service';

interface SmartLink {
    type: string;
    key: string;
    sources: PairDto[];
    backup: 'ASAP' | 'END';
    unique: boolean;
    authentication: 'manual' | 'automatic';
    token?: string;
}

@Injectable()
export class SmartLinkService {

    constructor(
        protected authService: AuthService,
        protected authAdminService: AuthAdminService,
        protected http: HttpClient,
        protected env: EnvService,
    ) { }

    getSmartLinkParameters(smartLink: SmartLinkDto): Observable<string> {

        const endToken = this._getDate(smartLink.duration);
        if (smartLink.authentication === 'manual' ) {
            return of(this._createLink(smartLink, ''));
        }

        return this.authAdminService.validateTokenUser(smartLink.automaticLogin.user, smartLink.automaticLogin.password, endToken)
            .pipe(
                catchError((err) => {
                    throw err;
                }),
                map((token: any) => {
                    if (token) {
                        return this._createLink(smartLink, token.token);
                    }
                }),
            );
    }

    sendMail(mail: EMailDto): Observable<any> {
        return this.authAdminService.sendTokenMail(mail);
    }

    _decodeB64(code64: string): SmartLink {
        const decodeString = window.atob(code64);
        return JSON.parse(decodeString);
    }

    private _createLink(smartLink: SmartLinkDto, token: string): string {
        const emb: SmartLink = {
            type: smartLink.type,
            key: smartLink.key,
            sources: smartLink.sources,
            unique: smartLink.unique,
            authentication: smartLink.authentication,
            backup: smartLink.backupType,
            token: token,
        };
        const encode = this._encodeB64(emb);
        return encode;
    }

    private _encodeB64(object: SmartLink): string {
        const json = JSON.stringify(object);
        return window.btoa(json);
    }

    private _getDate(calculDate: string): number {
        const counter = calculDate.substr(0, 1);
        const type = this._getDurationType(calculDate.substr(1, 0));

        const currentDate = moment();
        const endDate = moment(currentDate).add(counter, type);
        return endDate.diff(currentDate, 'seconds');
    }

    private _getDurationType(key: string): moment.DurationInputArg2 {
        switch (key) {
            case 'h':
                return 'hour';
            case 'd':
                return 'day';
            case 'w':
                return 'week';
            case 'm':
                return 'month';
            case 'y':
                return 'year';
        }
    }
}
