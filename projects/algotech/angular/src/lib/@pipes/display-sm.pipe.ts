import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { SettingsDataService } from '../settings/settings-data.service';
import { SmartModelDto } from '@algotech-ce/core';
import { TranslateLangDtoService } from '../@services/translate-lang-dto.service';

@Pipe({ name: 'displaySM' })
export class DisplaySMPipe implements PipeTransform {

    constructor(
        private settingsDataService: SettingsDataService,
        private translateLangDtoService: TranslateLangDtoService,
    ) { }

    transform(smKeys: string[]): string {
        if (!smKeys || smKeys.length === 0 ) { return ''; }
        const smDisplays: string[] =  _.reduce(this.settingsDataService.smartmodels, (res: string[], smartmodel: SmartModelDto) => {
            if (_.includes(smKeys, smartmodel.key)) {
                res.push(this.translateLangDtoService.transform(smartmodel.displayName));
            }
            return res;
        }, []);
        return smDisplays.join(', ');
    }

}
