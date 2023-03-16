import { Injectable } from '@angular/core';
import { SocketModelService } from '../@websockets/socket-model.service';
import { SocketManager } from '../@websockets/socket-manager.service';

@Injectable()
export class SocketNotificationsService extends SocketModelService {
    constructor(protected _socketManager: SocketManager) {
        super(_socketManager);
        this.event = 'event.notifications';
        this.errorReload = true;
    }
}
