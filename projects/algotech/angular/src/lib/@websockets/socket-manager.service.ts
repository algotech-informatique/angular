import { Injectable } from '@angular/core';
import { QueueingSubject } from 'queueing-subject';
import connect from 'rxjs-websockets';
import { Observable, Subject, Subscription } from 'rxjs';
import * as _ from 'lodash';
import { WsUserDto } from '@algotech-ce/core';
import { retryWhen, delay, catchError } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';
import { LoadingOptions } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { EnvService } from '../base/env.service';

@Injectable({
    providedIn: 'root'
})
export class SocketManager {

    WS_URL: string;
    production: boolean;

    public input: QueueingSubject<string>;
    public messages: Observable<string>;
    public connectionStatus: Observable<number>;
    public messageListeners: { pattern: string; executor: (data) => any }[] = [];
    public uniqueUsers = new Subject<WsUserDto[]>();
    //
    private obsLoadData: Observable<any>;
    private connectionStatusSubscription;
    private messagesSubscription: Subscription;
    private _users: WsUserDto[] = [];
    private connect = false;

    //
    get users(): WsUserDto[] {
        return this._users;
    }

    constructor(
        private authService: AuthService,
        private loadingController: LoadingController,
        private translate: TranslateService,
        protected env: EnvService) {

            this.env.environment.subscribe((e) => {
                this.WS_URL = e.WS_URL;
                this.production = e.production;
            });
    }

    public async loadData(state: 'loading' | 'error') {
        if (!this.obsLoadData) {
            return;
        }

        let opt: LoadingOptions;
        switch (state) {
            case 'loading': {
                opt = {
                    message: this.translate.instant('WS.LOADING'),
                };
                break;
            }
            case 'error': {
                opt = {
                    message: this.translate.instant('WS.ERROR')
                };
                break;
            }
        }
        const loading = await this.loadingController.create(opt);
        loading.present();
        this.obsLoadData.subscribe(() => {
            setTimeout(() => {
                loading.dismiss();
            }, 500);
        });
    }

    public async start(obsLoadData?: Observable<any>, defaultUrl = false) {
        if (this.connect) {
            return;
        }

        this.connect = true;

        this.obsLoadData = obsLoadData;
        this.input = new QueueingSubject<string>();
        const { messages, connectionStatus } = ((connect as any)?.default ?? connect)(this.formatUrl(defaultUrl, this.authService.localProfil.key), this.input);
        // const { messages, connectionStatus } = websocketConnect(`${this.WS_URL}?jwt=${key}`, this.input);
        this.connectionStatus = connectionStatus;
        this.messages = messages;

        // the connectionStatus stream will provides the current number of websocket
        // connections immediately to each new observer and updates as it changes

        this.connectionStatusSubscription = connectionStatus.subscribe(numberConnected => {
            console.log('number of connected websockets:', numberConnected);
        });

        // try to reconnect every second
        this.messagesSubscription = messages
            .subscribe(message => {
                let json = JSON.parse(message);
                if (json._isScalar) {
                    json = json.value;
                }

                if (json && json.event && json.data) {
                    // Récupération users
                    if (json.event === 'ws.initialize') {
                        this.loadData('loading');
                        this._users.splice(0, this._users.length);
                        Array.from(json.data).forEach(
                            (user: WsUserDto) => {
                                this._users.push(user);
                            });
                        this.uniqueUsers.next(this.getUniqueUsers());
                    } else if (json.event === 'ws.user.add') {
                        this._users.push(json.data);
                        this.uniqueUsers.next(this.getUniqueUsers());
                    } else if (json.event === 'ws.user.rm' && json.data && json.data.color) {
                        const index = _.findIndex(this._users, (user) => user.color === json.data.color);
                        if (index > -1) {
                            this._users.splice(index, 1);
                            this.uniqueUsers.next(this.getUniqueUsers());
                        }
                    } else {
                        _.forEach(this.messageListeners, (ml) => {
                            if (json.event === ml.pattern) {

                                ml.executor(json.data);
                            }
                        });
                    }
                }
            },
            (e) => {
                this.close();
                setTimeout(() => {
                    this.start(obsLoadData, defaultUrl);
                }, 1000);
            });
    }

    public getUniqueUsers(): WsUserDto[] {
        const _wsUsers = _.filter(this._users, u => u.uuid !== this.authService.localProfil.id);
        return _.uniqBy(_wsUsers, 'uuid');
    }

    public close() {
        if (!this.connect) {
            return;
        }

        this.connect = false;

        this._users.splice(0, this._users.length);
        this.messagesSubscription.unsubscribe();
        this.connectionStatusSubscription.unsubscribe();
    }

    private formatUrl(defaultUrl, key) {
        const protocol = window.location.protocol;
        return `${this.production ? `${protocol === 'http:' ? 'ws' : 'wss'}` : 'ws'}://${defaultUrl ? window.location.host : ''}${this.WS_URL}?jwt=${key}`;
    }
}
