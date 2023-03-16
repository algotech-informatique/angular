import { Component } from '@angular/core';
import {
    ApplicationModelsService, AuthAdminService, AuthService, DocumentsService, GeoLocationService, GroupsService, LoaderService, NetworkService, SmartFlowsService, SmartLinkService, SmartObjectsService,
    SmartTasksService, SocketManager, UsersService, WorkflowModelsService, I18nImportService, RxExtendService,
} from '../../projects/algotech/angular/src/public_api';
import {
    EMailDto, SmartLinkDto, PageModelDto, PairDto,
    SmartObjectDto, UserDto, WorkflowModelDto, SmartTaskLogDto, ApplicationModelDto, DocumentDto, SearchSODto
} from '@algotech/core';
import { PageModelsService } from '../../projects/algotech/angular/src/lib/page-models/page-models.service';
import { mergeMap, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    result = null;
    connected;

    constructor(
        private workflowsService: WorkflowModelsService,
        private smartObjectsService: SmartObjectsService,
        private pageModelService: PageModelsService,
        private authService: AuthService,
        private authServiceAdmin: AuthAdminService,
        private smartTaskService: SmartTasksService,
        private userService: UsersService,
        private smartLink: SmartLinkService,
        private applicationModelsService: ApplicationModelsService,
        private loaderService: LoaderService,
        private geo: GeoLocationService,
        private documentService: DocumentsService,
        private smartFlowsService: SmartFlowsService,
        private rxExtends: RxExtendService,
        private network: NetworkService,
        private groupsService: GroupsService,
        private socket: SocketManager,
        private i18nService: I18nImportService,
    ) {
        this.connected = this.authService.isAuthenticated;
    }

    geolocation() {
        this.geo.checkGPSPermission().subscribe();
    }

    checkMailNotify() {
        return this.userService.get('a4ebebca-7d3b-6937-d138-a114247ae606')
            .pipe(
                mergeMap((user: UserDto) => {
                    console.log('user', user);
                    return this.smartTaskService.createNewSmartTaskPasswordModify(user, 7);
                })
            ).subscribe((data) => {
                console.log('data', data);
            });
    }

    deleteFlowKey() {
        return this.smartTaskService.deleteByFlowKey('task_notify_pcreator')
            .pipe(
            ).subscribe((data) => {
                console.log('data', data);
            });
    }

    validatePasswordAdmin() {
        return this.authServiceAdmin.resetPasswordByAdmin('123459', true, 'a4ebebca-7d3b-6937-d138-a114247ae606')
            .pipe(
            ).subscribe((data) => {
                console.log('data', data);
            });
    }

    test() {
        this.workflowsService.list([{ key: 'filter', value: 'display' }]).subscribe((res: WorkflowModelDto[]) => {
            this.result = res[0].displayName[0].value;
        });
    }

    checkSmartTaskLog() {
        if (this.connected) {
            this.smartTaskService.getSmartTaskLogs('a082f30b-5600-79a5-3cd8-524d3815c69f').subscribe((data: SmartTaskLogDto[]) => {
                console.log('data', data);
            });
        }
    }

    load() {
        this.loaderService.Initialize().subscribe();
    }

    accountConsole() {
        this.authService.accountConsole().subscribe();
    }

    adminConsole() {
        this.authService.adminConsole();
    }

    connect() {
        this.authService.signin().subscribe(() => {
            this.connected = this.authService.isAuthenticated;
            console.log('islogged after login', this.authService.isAuthenticated);
        });
    }

    disconnect() {
        this.connected = this.authService.isAuthenticated;
        this.authService.logout().subscribe(() => {
            console.log('islogged after login', this.authService.isAuthenticated);
        });
    }

    searchData() {

        console.log('launch');
        this.smartObjectsService.searchBySkillFilter('geolocation',
            'machine', 'plan-entre-sol', 0, 0, 24,
            'NAME', '', 'LEVEL', '6', 'NAME|DESIGNATION', '3019').subscribe((datas: SmartObjectDto[]) => {
                console.log(datas);
            });
        this.smartObjectsService.searchBySkill('geolocation',
            'machine', 'plan-entre-sol', 0, 0, 24,
            'NAME', '', 'LEVEL', '6').subscribe((datas: SmartObjectDto[]) => {
                console.log(datas);
            });
    }

    cacheSearchByProperty() {
        this.rxExtends.sequence([
            this.smartObjectsService.searchByProperty('voiture', null, 'ren',
                [{ key: 'limit', value: 10 }, { key: 'skip', value: 0 }]).pipe(tap((res) => {
                    console.log(res);
                })),
            this.smartObjectsService.searchByProperty('voiture', null, 'ren',
                [{ key: 'skip', value: 0 }, { key: 'limit', value: 10 }]),
            this.smartObjectsService.searchByProperty('voiture', null, 'tes',
                [{ key: 'skip', value: 0 }, { key: 'limit', value: 10 }])
        ]).subscribe();
    }

    cacheSmartFlows() {
        this.network.offline = false;
        this.smartFlowsService.start({
            inputs: [],
            key: 'test-service',
            toData: true,
        }).subscribe((res) => console.log(res));
    }

    getPageByKey() {
        console.log('launch ...');

        this.pageModelService.getByKey('test-page').subscribe(
            (data: PageModelDto) => {
                console.log('Data', data);
            });
    }

    getPageByModel() {
        console.log('launch ...');
        this.pageModelService.getBySmartnodes('209b84e7-9e82-2c0c-e13a-238cf23f5e60').subscribe(
            (data: PageModelDto) => {
                console.log('Data', data);
            });
    }

    getFilterProp() {
        console.log('launch ...');
        this.smartObjectsService.listPropertyValuesES('organes-de-coupure', 'TYPE-2', 0, 10, 'asc').subscribe(
            (data: PairDto[]) => {
                console.log('Data', data);
            });
    }

    testQuerySearch() {
        const sos: SearchSODto = {
            modelKey: 'machine',
            filter: [
                { key: 'NAME', value: { criteria: 'in', value: ['AAA1', 'AAAa1'], type: 'string' } },
                { key: 'DESIGNATION', value: { criteria: 'in', value: ['1AAA'], type: 'string' } },
            ],
            order: [],

        }
        this.smartObjectsService.QuerySearchSO(sos, 0, 1000).subscribe((data) => {
            console.log('data', data);
        });
    }

    checkEmbebdedLink() {
        // return this.authServiceAdmin.validateTokenUser('pblanco1', '****', 99999);
        const e: SmartLinkDto = {
            type: 'workflow',
            key: 'get-machines',
            sources: [{
                key: 'a',
                value: 'a-1'
            }],
            authentication: 'automatic',
            backupType: 'ASAP',
            duration: '1D',
            unique: false,
            automaticLogin: {
                user: 'user-code',
                password: '******',
            }
        };
        this.smartLink.getSmartLinkParameters(e).subscribe();
    }

    deleteSmartTask() {
        return this.smartTaskService.delete('a01e2d36-36df-e19c-fe48-cdbe295db5b6').pipe(
        ).subscribe((data) => {
            console.log('return data', data);
        });
    }

    sendMailTOken() {
        const eMail: EMailDto = {
            content: 'test mail message',
            linkedFiles: ['http://algotech.vision'],
            subject: 'Test Mail',
            to: ['to@mail.com']
        };
        return this.smartLink.sendMail(eMail).subscribe((data) => {
            console.log('data', data);
        });
    }

    getApplicationModels() {
        this.applicationModelsService.get('b3cd1662-deb7-4a0f-aa24-376c5001ad91').pipe(
        ).subscribe((data: ApplicationModelDto) => {
            console.log('return data', data);
        });
    }

    testDocumentByName() {
        this.documentService.getByName('Manuel3').pipe(
        ).subscribe((data: DocumentDto) => {
            console.log('return data', data.uuid, data.name);
            this.result = '';
        });
    }

    getApplicationModelsByKey() {
        this.applicationModelsService.getByKey('test-page').pipe(
        ).subscribe((data: ApplicationModelDto) => {
            console.log('return data', data);
        });
    }

    getGroups() {
        return this.groupsService.list().subscribe((res) => console.log(res));
    }

    // resignin() {
    //     this.authService.reSignin().subscribe();
    // }

    socketStart() {
        this.socket.start(null, environment.production);
    }

    isAuthenticated() {
        console.log(this.authService.isAuthenticated);
    }

    refreshToken() {
        this.authService.updateToken().subscribe();
    }

    testImport(event) {
        const file = event.target.files[0];
        this.smartObjectsService.import(
            file, {
                uuid: '353b7421-d327-4220-9f9c-85091f8ff9f0',
                modelKey: 'allTypes',
                replaceExisting: true,
                options: {
                    delimiter: ',',
                    propertiesFormat: [{
                        key: 'DATE',
                        value: 'DD/MM/YYYY'
                    }, {
                        key: 'TIME',
                        value: 'hh[h]mm'
                    }]
                }
            }).subscribe((res) => {
            console.log(res);
        })
    }

    exportI18nFile() {
        this.i18nService.exportI18nFile(true).subscribe(
            (data: boolean) => {
                console.log('Export data', data);
        });
    }

    importI18nFile(event) {
        const file = event.target.files[0];
        this.i18nService.importI18nFile(file).subscribe(
            (data: boolean) => {
                console.log('Import data', data);

        });
    }
}
