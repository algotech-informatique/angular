import { GenericListDto, GenericListValueDto, PairDto, SmartModelDto, SmartPropertyModelDto, SmartPropertyObjectDto } from '@algotech/core';
import { Injectable } from '@angular/core';
import { SettingsDataService } from '../settings/settings-data.service';
import * as _ from 'lodash';
import { TranslateLangDtoService } from './translate-lang-dto.service';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';

@Injectable()
export class TransformDisplayService {

    constructor(
        private settingsDataService: SettingsDataService,
        private translateLangDtoService: TranslateLangDtoService,
        private translateService: TranslateService,
    ) { }

    validateNameFromList(modelKey: string, propKey: string, listElements: string[]): PairDto[] {

        const smartModel = _.find(this.settingsDataService.smartmodels, (sm: SmartModelDto) => sm.key === modelKey);
        if (!smartModel) {
            return this.transformPair(listElements, null, '');
        }
        const propModel: SmartPropertyModelDto = _.find(smartModel.properties, (sm: SmartPropertyModelDto) => sm.key === propKey);
        if (!propModel) {
            return this.transformPair(listElements, null, '');
        } else {
            if (propModel.keyType === 'string' && propModel.items && propModel.items !== '') {
                const item = _.isArray(propModel.items) ? propModel.items[0] : propModel.items;
                return this.transformPair(listElements, propModel, item);
            } else {
                return this.transformPair(listElements, propModel, '');
            }
        }
    }

    private transformPair(listElements: string[], prop: SmartPropertyModelDto, item): PairDto[] {
        return _.map(listElements, (element) => {
            const pair: PairDto = {
                key: element,
                value: (item === '') ? this.validateDisplayFormat(element, prop) : this.getGenericListObjects(element, item),
            };
            return pair;
        });
    }

    getGenericListObjects(key: string, listKey): string {

        const list = _.find(this.settingsDataService.glists, (lst: GenericListDto) => lst.key === listKey);
        if (!list) { return key; }
        const ele: GenericListValueDto = _.find(list.values, (element: GenericListValueDto) => element.key === key);
        if (!ele || !ele.value) {
            return null;
        }
        return this.translateLangDtoService.transform(ele.value);
    }

    validateDisplayFormat(data: any, property: SmartPropertyModelDto): string {
        if (!property) {
            return data;
        }

        switch (property.keyType) {
            case 'date': {
                return new Date(data).toLocaleDateString(this.translateService.currentLang);
            }
            case 'datetime': {
                return new Date(data).toLocaleString(this.translateService.currentLang);
            }
            case 'time': {
                return moment(data, 'HH:mm:ss').isValid() ? moment(data, 'HH:mm:ss').format('LT') : null;
            }
            case 'sys:comment': {
                return data ? data.message : '';
            }
            case 'boolean': {
                return ((_.isBoolean(data) && data) || data === 'true' || data === '1') ?
                    `✔ ${this.translateService.instant('SN-CONDITION-OK')}` :
                    `✕ ${this.translateService.instant('SN-CONDITION-KO')}`;
            }
            default: {
                return data;
            }
        }
    }
}
