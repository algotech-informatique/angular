import { Injectable } from '@angular/core';
import { SettingsDataService } from '../settings/settings-data.service';
import { SmartObjectDto, SmartModelDto, SmartPropertyModelDto,
    PlanGeneralDisplayPropertyDto } from '@algotech/core';
import * as _ from 'lodash';
import { flatMap, catchError } from 'rxjs/operators';
import { Observable, of} from 'rxjs';
import { SmartObjectsService } from '../smart-objects/smart-objects.service';

import { TranslateService } from '@ngx-translate/core';
import { TransformDisplayService } from '../@services/transform-display.service';

@Injectable()
export class GestionDisplaySettingsService {

    constructor(
        private settingsDataService: SettingsDataService,
        private smartObjectsService: SmartObjectsService,
        private translateService: TranslateService,
        private transformDisplayService: TransformDisplayService,
    ) { }

    isUUID(str: string) {
        const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
        return regexExp.test(str); // true
    }

    validateNameFromSettings(so: SmartObjectDto, name: 'primary' | 'secondary' | 'tertiary' | 'icon',
        findSo?: (uuid: string) => Observable<SmartObjectDto>, smartObjects: SmartObjectDto[] = []): Observable<string> {
        // check recursive
        if (smartObjects.indexOf(so) > -1) {
            return of(null);
        }
        smartObjects.push(so);

        if (!this.settingsDataService.settings || !this.settingsDataService.glists) {
            throw new Error('settings not initialized');
        }

        const settings: PlanGeneralDisplayPropertyDto =
            _.find(this.settingsDataService.settings.plan.general.displayPlanSO.propertyList, { name });
        if (!settings || !so) { return of(null); }
        const propSetting = _.find(settings.smartModel, { smModel: so.modelKey });
        if (!propSetting) { return of(null); }
        const prop = _.find(so.properties, { key: propSetting.smField });
        if (!prop) {return of(null); }

        const isTable = _.isArray(prop.value) ? true : false;
        if (isTable) { return of(null); }

        if (this.isUUID(prop.value)) {
            const obs = findSo ? findSo(prop.value) : this.smartObjectsService.get(prop.value);
            return obs.pipe(
                flatMap((childSo: SmartObjectDto) => {
                    return this.validateNameFromSettings(childSo, 'primary', findSo);
                }),
                catchError(() => of(this.validateDisplayedValue(prop.value, name))),
            );
        } else {
            const smartModel = _.find(this.settingsDataService.smartmodels, (sm: SmartModelDto) => sm.key === so.modelKey);
            if (!smartModel) {
                return of(this.validateDisplayedValue(prop.value, name));
            } else {
                const propModel: SmartPropertyModelDto = _.find(smartModel.properties, (sm: SmartPropertyModelDto) => sm.key === prop.key);
                if (!propModel) {
                    return of(this.validateDisplayedValue(prop.value, name));
                } else {
                    if (propModel.keyType === 'string' && propModel.items && propModel.items !== '') {
                        const item = _.isArray(propModel.items) ? propModel.items[0] : propModel.items;
                        return of(this.validateDisplayedValue(this.transformDisplayService.getGenericListObjects(prop.value, item), name));
                    } else {
                        return of(this.validateDisplayedValue(
                            this.transformDisplayService.validateDisplayFormat(prop.value, propModel), name));
                    }
                }
            }
        }
    }

    private validateDisplayedValue(data: any, name: 'primary' | 'secondary' | 'tertiary' | 'icon' ): any {
        return (name !== 'primary') ? data : ((!data || data === '') ? this.translateService.instant('ITEM.NO-DISPLAY-AVAILABLE') : data);
    }
}
