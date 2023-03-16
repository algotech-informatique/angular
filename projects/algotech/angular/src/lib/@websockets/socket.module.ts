import { NgModule } from '@angular/core';
import { SocketManager } from './socket-manager.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule,
    ],
    providers: [
        SocketManager
    ]
})
export class SocketModule { }
