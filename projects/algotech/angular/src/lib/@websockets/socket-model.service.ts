import { Injectable } from '@angular/core';
import { SocketManager } from './socket-manager.service';
import * as _ from 'lodash';
import { PatchPropertyDto, WsUserDto } from '@algotech/core';

@Injectable({
    providedIn: 'root'
})
export class SocketModelService {

    protected event: string;
    protected errorReload = true;

    private ackKey = '.ack';
    private errKey = '.err';
    private addKey = '.add';
    private chgKey = '.chg';
    private rmKey = '.rm';
    private focusKey = '.focus';
    private sendKey = '.send';

    private zone = null;
    private _focus: WsUserDto[] = [];
    get focus() {
        this._focus.splice(0, this._focus.length);
        _.forEach(this._socketManager.users, (user) => {
            if (user.focus && user.focus.pattern === this.event) {
                this._focus.push(user);
            }
        });
        return this._focus;
    }

    constructor(protected _socketManager: SocketManager) {
    }

    protected notify(data: any, postfixEvent?: string): void {
        this._socketManager.input.next(JSON.stringify({ event: this.event + postfixEvent, data }));

        // Reload after error
        if (this.errorReload) {
            const pattern = this.event + postfixEvent + this.errKey;
            if (_.findIndex(this._socketManager.messageListeners, item => item.pattern === pattern) === -1) {
                this.on(pattern, () => {
                    this._socketManager.loadData('error');
                });
            }
        }
    }

    public notifyAdd(value: any): void {
        this.notify(value, this.addKey);
    }

    public notifyChg(uuid: string, patches: PatchPropertyDto[]): void {
        const notification = { uuid, patches };
        this.notify(notification, this.chgKey);
    }

    public notifyRm(uuid: string): void {
        this.notify(uuid, this.rmKey);
    }

    protected on(pattern: string, executor, anycast: boolean = false) {
        this._socketManager.messageListeners.push({ pattern, executor });
        if (anycast) {
            this._socketManager.messageListeners.push({ pattern: pattern + this.ackKey, executor });
        }
    }

    public onAdd(executor, anycast: boolean = false) {
        this.on(this.event + this.addKey, executor, anycast);
    }

    public onChange(executor, anycast: boolean = false) {
        this.on(this.event + this.chgKey, executor, anycast);
    }

    public onRemove(executor, anycast: boolean = false) {
        this.on(this.event + this.rmKey, executor, anycast);
    }

    public onReceive(executor, anycast: boolean = false) {
        this.on(this.event + this.sendKey, executor, anycast);
    }

    public notifyFocus(zone): void {
        if (!this.zone || this.zone !== zone) {
            this.zone = zone;
            this.notify(this.zone, this.focusKey);
        }
    }

    public initializeFocus() {
        this.zone = null;
        const cbChange = ((data: any) => {
            const aUser = _.find(this._socketManager.users, user => user.color === data.color);
            if (aUser) {
                if (aUser.focus) {
                    aUser.focus.zone = data.zone;
                } else {
                    aUser.focus = {
                        pattern: this.event,
                        zone: data.zone,
                    };
                }
            }
        });
        this._socketManager.messageListeners.push({ pattern: this.event + this.focusKey + this.chgKey, executor: cbChange });
    }
}
