/*
 * Public API Surface of ionic
 */

/*
    MODULES
*/
export * from './lib/@websockets/socket.module';
export * from './lib/@directives/directives.module';
export * from './lib/angular.module';
export * from './lib/geoLocation/geoloc.module';
export * from './lib/base/data-module';

/*
    PROVIDERS
*/
export * from './lib/auth/auth.module';
export { AuthService } from './lib/auth/auth.service';
export { SignInGuard } from './lib/auth/sign-in.guard';
export { AuthAdminService } from './lib/auth/auth-admin.service';
export { GroupsService } from './lib/groups/groups.service';
export { I18nService } from './lib/i18n/i18n.service';
export { I18nImportService } from './lib/i18n/i18n-import.service';
export { SmartModelsService } from './lib/smart-models/smart-models.service';
export { SmartObjectsService } from './lib/smart-objects/smart-objects.service';
export { WorkflowModelsService } from './lib/workflow-models/workflow-models.service';
export { WorkflowInstancesService } from './lib/workflow-instances/workflow-instances.service';
export { ModelerService } from './lib/modeler/modeler.service';
export { UsersService } from './lib/users/users.service';
export { BaseService } from './lib/base/base.service';
export { BaseCacheService } from './lib/base/base.cache.service';
export { DomainsService } from './lib/domains/domains.service';
export { CustomersService } from './lib/customers/customers.service';
export { SocketManager } from './lib/@websockets/socket-manager.service';
export { SocketModelService } from './lib/@websockets/socket-model.service';
export { SocketNotificationsService } from './lib/notifications/notifications.socket.service';
export { SettingsService } from './lib/settings/settings.service';
export { SettingsDataService } from './lib/settings/settings-data.service';
export { GenericListsService } from './lib/glists/glists.service';
export { GenericListsDisplayService } from './lib/glists/glists-display.service';
export { TranslateLangDtoService } from './lib/@services/translate-lang-dto.service';
export { DocumentIconDtoService} from './lib/@services/document-icon-dto.service';
export { KeyFormaterService } from './lib/@services/key-formater.service';
export { EmailService } from './lib/email/email.service';
export { NotificationsService } from './lib/notifications/notifications.service';
export { ReportsService } from './lib/reports/reports.service';
export { ScheduleService} from './lib/schedule/schedule.service';
export { DocumentsService } from './lib/documents/documents.service';
export { TagsService} from './lib/tags/tags.service';
export { GestionDisplaySettingsService } from './lib/gestion-display-settings/gestion-display-settings.service';
export { GeoLocationService } from './lib/geoLocation/geoloc.service';
export { DataService } from './lib/base/data-service';
export { NetworkService } from './lib/base/network.service';
export { EnvService } from './lib/base/env.service';
export { SmartNodesService } from './lib/smart-nodes/smart-nodes.service';
export { EnvironmentsService } from './lib/environments/environments.service';
export { SmartFlowsService } from './lib/smart-flows/smart-flows.service';
export { TransformDisplayService } from './lib/@services/transform-display.service';
export { PageModelsService } from './lib/page-models/page-models.service';
export { SmartTasksService } from './lib/smart-task/smart-task.service';
export { SmartLinkService } from './lib/smart-link/smart-link.service';
export { ApplicationModelsService } from './lib/application-models/application-models.service';
export { DatabaseService } from './lib/database/database.service';
export { ConvertService } from './lib/convert/convert.service';
export { AuditTrailService } from './lib/audit-trail/audit-trail.service';
export { LoaderService } from './lib/base/loader.service';
export { MonitoringService } from './lib/monitoring/monitoring.service';
export { RxExtendService } from './lib/utils/rx-extend.service';

/*
    MOCKS
*/
export { applications } from './lib/mocks/mock-application';
export { sources } from './lib/mocks/mock-wf-sources';
export { WS_USERS_COLORS } from './lib/mocks/mock-ws-user-color';

/*
    DIRECTIVES
*/
export { DirectivesModule } from './lib/@directives/directives.module';
export { TooltipsDirective } from './lib/@directives/tooltips.directive';

/*
    PIPES
*/
export * from './lib/@pipes/pipes.module';

/*
    ERRORS
*/
export * from './lib/base/base.cache.error';

/*
    MODELS
*/
export * from './lib/models/application';
export * from './lib/models/local-profil';

// for angular 9
export { FadeInOutDirective } from './lib/@directives/animations/fade-in-out.directive';
export { ClickOutsideDirective } from './lib/@directives/click-outside.directive';
export { FormTabContentDirective } from './lib/@directives/form-tab-content.directive';
export { WsFocusDirective } from './lib/@directives/ws-focus-directive';
export { IconsService } from './lib/@services/icons.service';

export { DisplaySOPipe as ɵw } from './lib/@pipes/display-so.pipe';
export { FirstUpperCasePipe as ɵt } from './lib/@pipes/first-upper-case.pipe';
export { LinkPipe as ɵu } from './lib/@pipes/link.pipe';
export { LocaleDatePipe as ɵr } from './lib/@pipes/locale-date.pipe';
export { TranslateLangDtoPipe } from './lib/@pipes/translate-lang-dto.pipe';
export { TruncatePipe as ɵv } from './lib/@pipes/truncate.pipe';

export { FilterPipe } from './lib/@pipes/filter.pipe';
export { FindPipe  } from './lib/@pipes/find.pipe';
export { IncludesPipe  } from './lib/@pipes/includes.pipe';
export { SplitPipe  } from './lib/@pipes/split.pipe';
export { SafeHtmlPipe  } from './lib/@pipes/safehtml.pipe';
export { SafePipe  } from './lib/@pipes/safe.pipe';
export { DisplaySMPipe  } from './lib/@pipes/display-sm.pipe';
export { DateFormatPipe } from './lib/@pipes/date.format.pipe';
