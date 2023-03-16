import { Injectable, NgZone } from '@angular/core';
import { Network, ConnectionStatus } from '@capacitor/network';
import * as _ from 'lodash';
import { from, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class NetworkService {

    private signal: any;
    protected connectionType = 'none';
    private color = [
        '#838383',
        '#D91515',
        '#D97415',
        '#D9D015',
        '#15D942'
    ];

    public offline = false;
    public displayColor = this.color[0];
    public onConnect = new Subject();

    constructor(
        private zone: NgZone,
    ) {
        Network.addListener('networkStatusChange', (status: ConnectionStatus) =>  {
            this.zone.run(() => {
                this.refresh(status);
                if (status.connected) {
                    this.onConnect.next(null);
                }
            })
        });

        this.initialize().subscribe();
    }

    public initialize() {
        return from(Network.getStatus()).pipe(
            map((status: ConnectionStatus) => {
                this.refresh(status);
                return this.offline;
            })
        );
    }

    public refresh(status: ConnectionStatus) {
        this.offline = status.connectionType === 'none' ? true : false;
        this.displayColor = this.offline ? this.color[0] : this.color[4];
    }

    public setOffline() {
        this.offline = true;
        this.displayColor = this.color[0];

        // refresh the state of network after 1s
        setTimeout(() => {
            from(Network.getStatus()).subscribe((status: ConnectionStatus) => this.refresh(status));
        }, 1000);
    }

    public init() {
        return ;
        // setInterval(() => {
        //     window.SignalStrength.getSignal((signal: any) => {
        //         this.signal = signal;
        //         this.connectionType = this.network.type;
        //         switch (this.connectionType) {
        //             case 'cellular':
        //             case '2g':
        //             case '3g':
        //             case '4g':
        //                 this.displayColor = this.color[this.signal.Level];
        //                 this.isConnected = true;
        //                 break;
        //             case 'none':
        //                 this.displayColor = this.color[0];
        //                 this.isConnected = false;
        //                 break;
        //             default:
        //                 this.displayColor = this.color[4];
        //                 this.isConnected = true;
        //                 break;
        //         }
        //         // console.log('SIGNAL:', this.connectionType, signal);
        //     });
        // }, 2000);
    }
}
