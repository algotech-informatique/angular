import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericListDto, GenericListValueDto } from '@algotech/core';
import { AuthService } from '../auth/auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { TranslateLangDtoService } from '../@services/translate-lang-dto.service';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import { EnvService } from '../base/env.service';

@Injectable()
export class GenericListsService extends BaseCacheService<GenericListDto> {

    constructor(
        protected dataService: DataService,
        private readonly translateLangDtoService: TranslateLangDtoService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        super(dataService, authService, http, env);
        this.keyName = 'key';
        this.prefix = 'glist';
        this.serviceUrl = '/glists';
    }

    getSorted(keyList: string, sort: 'default' | 'asc' | 'desc' = 'default'): Observable<GenericListDto> {
        const gList = this.get('key/' + keyList);
        return gList.pipe(
            map((gListToSort: GenericListDto) => {
                if (gListToSort) {
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
            }),
        );
    }
}
