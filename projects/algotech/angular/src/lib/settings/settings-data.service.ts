import { Injectable } from '@angular/core';
import { Observable, of, zip } from 'rxjs';
import { SettingsDto, PatchPropertyDto, WorkflowModelDto, SmartModelDto, GenericListDto, GroupDto, TagListDto,
    ApplicationModelDto } from '@algotech/core';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { SettingsService } from './settings.service';
import { PatchService } from '@algotech/core';
import { WorkflowModelsService } from '../workflow-models/workflow-models.service';
import { GenericListsService } from '../glists/glists.service';
import { SmartModelsService } from '../smart-models/smart-models.service';
import { GroupsService } from '../groups/groups.service';
import { TagsService } from '../tags/tags.service';
import { ApplicationModelsService } from '../application-models/application-models.service';

@Injectable()
export class SettingsDataService {

    private _settingsTmp: SettingsDto = null;
    public workflows: WorkflowModelDto[] = [];
    public smartmodels: SmartModelDto[] = [];
    public glists: GenericListDto[] = [];
    public groups: GroupDto[] = [];
    public settings: SettingsDto = null;
    public tags: TagListDto[];
    public apps: ApplicationModelDto[];

    constructor(
        private groupsService: GroupsService,
        private settingsService: SettingsService,
        private workflowsService: WorkflowModelsService,
        private smartModelsService: SmartModelsService,
        private genericListService: GenericListsService,
        public tagsService: TagsService,
        private applicationModelsService: ApplicationModelsService,
    ) { }

    public Initialize(): Observable<SettingsDto> {
        return zip(
            this.settingsService.getSettings(),
            this.workflowsService.list(),
            this.smartModelsService.list(),
            this.genericListService.list(),
            this.groupsService.list(),
            this.tagsService.list(),
            this.applicationModelsService.list(),
        ).pipe(
            map((results: any[]) => {
                this.settings = results[0];
                this.workflows = results[1];
                this.smartmodels = results[2];
                this.glists = results[3];
                this.groups = results[4];
                this.tags = results[5];
                this.apps = results[6];

                this._settingsTmp = _.cloneDeep(this.settings);
                return this.settings;
            }),
        );
    }

    settingsUpdate(): Observable<PatchPropertyDto[]> {
        const patches = new PatchService<SettingsDto>().compare(this._settingsTmp, this.settings);
        if (patches.length > 0) {
            this._settingsTmp = _.cloneDeep(this.settings);
            return this.settingsService.patchProperty(this.settings.uuid, patches);
        } else {
            return of(null);
        }
    }
}
