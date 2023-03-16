import { Injectable } from '@angular/core';
import { GenericListDto, GenericListValueDto } from '@algotech/core';
import * as _ from 'lodash';
import { TranslateLangDtoService } from '../@services/translate-lang-dto.service';
import { SettingsDataService } from '../settings/settings-data.service';

@Injectable()
export class GenericListsDisplayService {

    constructor(
        private translateLangDtoService: TranslateLangDtoService,
        private settingsDataService: SettingsDataService) {
        }

    public getSorted(keyList: string, sort: 'default' | 'asc' | 'desc' = 'default' ): GenericListDto {
        return this.findAndSortList(keyList, this.settingsDataService.glists, sort);
    }

    private findAndSortList(keyList: string, genericList: GenericListDto[], sort: 'default' | 'asc' | 'desc'): GenericListDto {
        const gListToSort = _.find(genericList, (gList: GenericListDto) => gList.key === keyList);
        if (!gListToSort) {
            return null;
        }
        return this.sortList(gListToSort, sort);
    }

    private sortList(gListToSort: GenericListDto, sort: 'default' | 'asc' | 'desc') {
        const newValues = [];
        const sortedList = _.cloneDeep(gListToSort);
        gListToSort.values.forEach((item: GenericListValueDto) => {
            newValues.push({ key: item.key, value: this.translateLangDtoService.transform(item.value), index: item.index });
        });

        switch (sort) {
            case 'asc': 
                newValues.sort((a, b) => a.value.localeCompare(b.value));
                break;
            case 'desc':
                newValues.sort((a, b) => b.value.localeCompare(a.value));
                break;
            default:
                newValues.sort((a,b) => a.index - b.index)
                break;
        }

        sortedList.values = newValues;
        sortedList.displayName = this.translateLangDtoService.transform(gListToSort.displayName);
        return sortedList;
    }
}
