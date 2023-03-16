import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { zip } from 'rxjs';
import { flatMap, map, tap } from 'rxjs/operators';
import { DocumentsService } from '../documents/documents.service';
import { SettingsDataService } from '../settings/settings-data.service';
import { SmartObjectsService } from '../smart-objects/smart-objects.service';
import { DataService } from './data-service';
import { EnvService } from './env.service';
import { NetworkService } from './network.service';

@Injectable()
export class LoaderService {
    api: string;

    constructor(
        private env: EnvService,
        private http: HttpClient,
        private networkService: NetworkService,
        private settingsDataService: SettingsDataService,
        private smartObjectsService: SmartObjectsService,
        private documentsService: DocumentsService,
        private dataService: DataService) {

        env.environment.subscribe((e) => this.api = e.API_URL);
    }

    Initialize(extras = of({})) {
        let date = null;
        return this.dataService.Initialize().pipe(
            flatMap(() => {
                // get date of server before
                return this.networkService.offline ? of(null) : this.http.get(`${this.api}/admin/information`).pipe(
                    tap((res: any) => {
                        date = new Date(res.date);
                    })
                );
            }),
            flatMap(() => this.settingsDataService.Initialize()),
            flatMap(() => {
                return zip(
                    this.networkService.offline ? of(null) : this.smartObjectsService.updateCache(),
                    this.networkService.offline ? of(null) : this.documentsService.updateCache(),
                    extras,
                );
            }),
            flatMap(() => date ? this.dataService.save(date, 'cache', 'date') : of(null))
        );
    }
}
