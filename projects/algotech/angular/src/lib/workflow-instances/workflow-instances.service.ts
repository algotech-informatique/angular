import { Injectable, Inject } from '@angular/core';
import { BaseService } from '../base/base.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { WorkflowInstanceDto, PairDto, WorkflowOperationDto, WorkflowInstanceAbstractDto, WorkflowStackTaskDto } from '@algotech/core';
import { AuthService } from '../auth/auth.service';
import { Observable, of, zip } from 'rxjs';
import { flatMap, catchError, map } from 'rxjs/operators';
import { DataService } from '../base/data-service';
import * as _ from 'lodash';
import moment from 'moment';
import { EnvService } from '../base/env.service';

@Injectable()
export class WorkflowInstancesService extends BaseService<WorkflowInstanceDto> {

    prefix = 'wfi';

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        super(authService, http, env);
        this.serviceUrl = '/workflow-instances';
    }

    public getByModel(uuid: string[], data: PairDto[] = []): Observable<WorkflowInstanceAbstractDto[]> {
        const wfisApi$ = this.obsHeaders()
        .pipe(
            flatMap((headers: HttpHeaders) => this.http.post<WorkflowInstanceAbstractDto[]>(
                `${this.api}${this.serviceUrl}/byModel`, { uuid, data }, { headers })),
            catchError((error: HttpErrorResponse) => this.handleError(this.getByModel(uuid, data), error))
        );

        const wfisLocal$ = !this.dataService.active ? of([]) : this.dataService.getAll(this.prefix).pipe(
            map((instances: WorkflowInstanceDto[]) => {
                return _.map(
                    _.filter(instances, (instance: WorkflowInstanceDto) => {

                    // state running && model
                    if (instance.state !== 'running' || uuid.indexOf(instance.workflowModel.uuid) === -1) {
                        return false;
                    }

                    // data
                    const conditionData = _.every(data, (d: PairDto) => {
                        const findData: PairDto = _.find(instance.data, (wfiData) => wfiData.key === d.key);
                        if (!findData) {
                            return true;
                        }
                        return _.isEqual(findData.value, d.value);
                    });

                    if (!conditionData) {
                        return false;
                    }

                    return true;
                }), (instance: WorkflowInstanceDto) => {
                    const activeStack = _.find(instance.stackTasks, (stack: WorkflowStackTaskDto) => stack.active);
                    const wfiAbstract: WorkflowInstanceAbstractDto = {
                        uuid: instance.uuid,
                        activeTask: activeStack ? activeStack.taskModel : null,
                        participants: instance.participants,
                        startDate: moment(instance.startDate).format(),
                        updateDate: moment(instance.updateDate).format(),
                        workflowModelUuid: instance.workflowModel.uuid,
                    };
                    return wfiAbstract;
                });
            })
        );

        if (!this.dataService.networkService.offline) {
            return zip(wfisApi$, wfisLocal$).pipe(map((res) => _.uniqBy(_.flatten(res), 'uuid')));
        } else {
            return wfisLocal$;
        }
    }

    public zipOperations(operations: WorkflowOperationDto[]) {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<WorkflowOperationDto[]>(
                    `${this.api}${this.serviceUrl}/zip`, operations, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.zipOperations(operations), error))
            );
    }
}
