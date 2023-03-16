import { Pipe, PipeTransform } from '@angular/core';
import { SmartObjectDto } from '@algotech/core';
import * as _ from 'lodash';
import { GestionDisplaySettingsService } from '../gestion-display-settings/gestion-display-settings.service';

@Pipe({ name: 'displaySO' })
export class DisplaySOPipe implements PipeTransform {

    constructor(
        private gestionDisplaySettingsService: GestionDisplaySettingsService) { }

    async transform(so: SmartObjectDto, value: 'primary' | 'secondary' | 'tertiary' | 'icon'): Promise<string> {
        if (!so || !value) { return ''; }
        return await this.gestionDisplaySettingsService.validateNameFromSettings(so, value).toPromise();
    }

}
