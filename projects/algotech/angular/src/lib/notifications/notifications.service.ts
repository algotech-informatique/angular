import { Injectable } from '@angular/core';
import { BaseService } from '../base/base.service';
import { HttpClient } from '@angular/common/http';
import { NotificationDto } from '@algotech/core';
import { AuthService } from '../auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, zip, of, throwError } from 'rxjs';
import { SmartObjectsService } from '../smart-objects/smart-objects.service';
import * as _ from 'lodash';
import { map, catchError } from 'rxjs/operators';
import { SocketNotificationsService } from './notifications.socket.service';
import { EnvService } from '../base/env.service';

const SIZE = 25;

@Injectable()
export class NotificationsService extends BaseService<NotificationDto> {

    constructor(
        // @Inject('config') protected config: ATConfig,
        protected smartObjectService: SmartObjectsService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected translate: TranslateService,
        private socketNotificationsService: SocketNotificationsService,
        protected env: EnvService
        // protected localStorage: LocalStorage
    ) {
        // super(config, http, localStorage);
        super(authService, http, env);
        this.serviceUrl = '/notifications';
        this._loadWebSocket = false;
    }

    notifications: NotificationDto[] = [];
    channel: 'mobile' | 'web';
    private skip = 0;
    private hasItems = true;
    private _unread = 0;
    private _loadWebSocket: boolean;

    unreadMessage = '';
    unreadFullMessage = '';
    set unread(value) {
        this._unread = value;
        this.unreadMessage = value > 9 ? '9+' : String(value);
        this.unreadFullMessage = this.translate.instant('NOTIFICATIONS.UNREAD.MESSAGE', { length: this.unreadMessage });
    }
    get unread() {
        return this._unread;
    }

    public loadNotifications(state: 'all' | 'unread', isnew: boolean = false): Observable<NotificationDto[]> {
        if (!this.hasItems) {
            return of([]);
        }
        return this.list(
            [
                { key: 'state', value: state },
                { key: 'skip', value: this.skip },
                { key: 'limit', value: SIZE },
                { key: 'channel', value: this.channel },
            ]).pipe(
                map((notifications: NotificationDto[]) => {
                    if (isnew) {
                        this.notifications = [];
                    }
                    this.notifications.push(...notifications);
                    this.skip = this.skip + SIZE;
                    this.hasItems = notifications.length === SIZE;

                    return this.notifications;
                }),
                catchError((err) => {
                    return throwError(err);
                })
            );
    }

    private loadData() {
        zip(
            this.list([
                { key: 'state', value: 'unread' },
                { key: 'limit', value: SIZE },
                { key: 'channel', value: this.channel },
            ]),
            this.loadNotifications('all', true),
        ).subscribe(
            (results: NotificationDto[][]) => {
                this.unread = results[0].length;
            }
        );
    }

    public loadWebSocket() {
        if (this._loadWebSocket === false) {
            this._loadWebSocket = true;

            this.socketNotificationsService.onAdd(((notification: NotificationDto) => {
                this.addNotification(notification);
            }));

            this.socketNotificationsService.onRemove(((uuid: string) => {
                this.removeNotification(uuid);
            }));
        }
    }

    public reset() {
        this.skip = 0;
        this.hasItems = true;
    }

    public initialize(channel: 'mobile' | 'web', socket = true) {
        this.channel = channel;
        this.reset();
        this.loadData();
        if (socket) {
            this.loadWebSocket();
        }
    }

    public addNotification(notification: NotificationDto) {
        this.notifications.unshift(notification);
        this.skip++;
        this.unread++;
    }

    public removeNotification(uuid: string) {
        const notification = this.notifications.find((n) => n.uuid === uuid);
        if (notification) {
            this.notifications.splice(this.notifications.indexOf(notification), 1);
            this.skip--;
            if (notification.state.read.indexOf(this.authService.localProfil.login) === -1) {
                if (this.unread === 10) {
                    this.list([
                        { key: 'state', value: 'unread' },
                        { key: 'limit', value: SIZE },
                        { key: 'channel', value: this.channel }
                    ]).subscribe((res: NotificationDto[]) => this.unread = res.length);
                } else {
                    this.unread--;
                }
            }
        }
    }

}