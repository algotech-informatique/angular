import { DatabaseService } from './database/database.service';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { DomainsService } from './domains/domains.service';
import { SocketManager } from './@websockets/socket-manager.service';
import { CustomersService } from './customers/customers.service';
import { ModelerService } from './modeler/modeler.service';
import { SettingsService } from './settings/settings.service';
import { SmartModelsService } from './smart-models/smart-models.service';
import { SmartObjectsService } from './smart-objects/smart-objects.service';
import { WorkflowModelsService } from './workflow-models/workflow-models.service';
import { GroupsService } from './groups/groups.service';
import { GenericListsService } from './glists/glists.service';
import { ReportsService } from './reports/reports.service';
import { ScheduleService } from './schedule/schedule.service';
import { TagsService } from './tags/tags.service';
import { GeoLocationService } from './geoLocation/geoloc.service';
import { DataModule } from './base/data-module';
import { GestionDisplaySettingsService } from './gestion-display-settings/gestion-display-settings.service';
import { SettingsDataService } from './settings/settings-data.service';
import { DocumentsService } from './documents/documents.service';
import { GenericListsDisplayService } from './glists/glists-display.service';
import { TranslateLangDtoService } from './@services/translate-lang-dto.service';
import { EnvService } from './base/env.service';
import { SmartNodesService } from './smart-nodes/smart-nodes.service';
import { EnvironmentsService } from './environments/environments.service';
import { SmartFlowsService } from './smart-flows/smart-flows.service';
import { NotificationsService } from './notifications/notifications.service';
import { SocketNotificationsService } from './notifications/notifications.socket.service';
import { PageModelsService } from './page-models/page-models.service';
import { TransformDisplayService } from './@services/transform-display.service';
import { AuthAdminService } from './auth/auth-admin.service';
import { SmartTasksService } from './smart-task/smart-task.service';
import { UsersService } from './users/users.service';
import { SmartLinkService } from './smart-link/smart-link.service';
import { ApplicationModelsService } from './application-models/application-models.service';
import { ConvertService } from './convert/convert.service';
import { AuditTrailService } from './audit-trail/audit-trail.service';
import { LoaderService } from './base/loader.service';
import { MonitoringService } from './monitoring/monitoring.service';
import { I18nImportService } from './i18n/i18n-import.service';

@NgModule({
    imports: [
        DataModule,
    ],
    exports: [
        DataModule,
    ],
    declarations: [],
})
export class ATAngularModule {

    public static forRoot(): ModuleWithProviders<ATAngularModule> {
        return {
            ngModule: ATAngularModule,
            providers: [
                SocketManager,
                CustomersService,
                ModelerService,
                SettingsService,
                SmartModelsService,
                DocumentsService,
                SmartObjectsService,
                ReportsService,
                ScheduleService,
                WorkflowModelsService,
                SmartFlowsService,
                GroupsService,
                DomainsService,
                GenericListsService,
                TagsService,
                SettingsDataService,
                TranslateLangDtoService,
                GenericListsDisplayService,
                GestionDisplaySettingsService,
                GeoLocationService,
                EnvService,
                NotificationsService,
                SocketNotificationsService,
                SmartNodesService,
                EnvironmentsService,
                PageModelsService,
                TransformDisplayService,
                AuthAdminService,
                SmartTasksService,
                UsersService,
                SmartLinkService,
                ApplicationModelsService,
                DatabaseService,
                ConvertService,
                AuditTrailService,
                LoaderService,
                MonitoringService,
                I18nImportService,
            ]
        };
    }
}
