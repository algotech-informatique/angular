import { IonicStorageModule } from '@ionic/storage-angular';
import { NgModule } from '@angular/core';
import { DataService } from './data-service';
import { NetworkService } from './network.service';

@NgModule({
    imports: [
        IonicStorageModule,
    ],
    providers: [
        NetworkService,
        DataService,
    ],
})
export class DataModule { }
