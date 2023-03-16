import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, concat, zip } from 'rxjs';
import { catchError, flatMap, map, first, toArray, mergeMap } from 'rxjs/operators';
import * as _ from 'lodash';
import {
    SmartObjectDto, SmartObjectSearchDto, QuerySearchDto,
    QuerySearchResultDto, FileUploadDto, PairDto, DocumentDto, SearchSODto, IndexationOptionsDto, DeleteDto, ImportSoResultDto, ImportOptionsDto,
} from '@algotech/core';
import { AuthService } from '../auth/auth.service';
import { ATSignatureDto, FileEditDto, ImportSoDto } from '@algotech/core';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import { DocumentsService } from '../documents/documents.service';
import { SettingsDataService } from '../settings/settings-data.service';
import { EnvService } from '../base/env.service';
import { TransformDisplayService } from '../@services/transform-display.service';

@Injectable()
export class SmartObjectsService extends BaseCacheService<SmartObjectDto> {

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        private settingsDataService: SettingsDataService,
        private documentsService: DocumentsService,
        protected env: EnvService,
        private transformDisplayService: TransformDisplayService,
    ) {
        super(dataService, authService, http, env);
        this.prefix = '$so';
        this.serviceUrl = '/smart-objects';
    }

    public soToObject<T>(so: SmartObjectDto): T {
        const myObject = _.assign(...so.properties.map((p: any) => {
            const obj = JSON.parse('{"' + p.key + '":null}');
            obj[p.key] = p.value;
            return obj;
        }));
        return Object.assign(myObject, { uuid: so.uuid }) as T;
    }

    public objectToSo(object: any, model: string): SmartObjectDto {

        const toPropertiesSmartObject = _.toPairs(object).map(p => {
            return { 'key': p[0], 'value': p[1] };
        });
        const idxUuid: number = _.findIndex(toPropertiesSmartObject, { key: 'uuid' });
        let uuid: { key: string, value: string };
        if (idxUuid > -1) {
            uuid = _.clone(toPropertiesSmartObject[idxUuid]);
            toPropertiesSmartObject.splice(idxUuid, 1);
        }

        const toSmartObject: any = {};
        Object.assign(toSmartObject, { 'modelKey': model }, { properties: toPropertiesSmartObject }, { 'skills': {} });
        if (uuid) { Object.assign(toSmartObject, { uuid: uuid.value }); }
        return toSmartObject;
    }

    public import(file: File, content: { uuid: string; modelKey: string; replaceExisting: boolean; options: ImportOptionsDto }): Observable<ImportSoResultDto> {
        const formData: FormData = new FormData();

        formData.append('file', file, file.name);
        formData.append('uuid', content.uuid);
        formData.append('modelKey', content.modelKey);
        formData.append('replaceExisting', content.replaceExisting ? 'true' : 'false');
        formData.append('options', JSON.stringify(content.options));

        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {

                    let newHeaders = _.cloneDeep(headers);
                    newHeaders = newHeaders.delete('Content-Type');
                    newHeaders = newHeaders.delete('Accept');
                    return this.http.post<SmartObjectDto>(`${this.api}${this.serviceUrl}/import`, formData, { headers: newHeaders });

                }),
                catchError((error: HttpErrorResponse) => this.handleError(this.import(file, content), error))
            );
    }

    findProperty(so: SmartObjectDto, propName: string): any {
        const prop = so.properties.find((p) => p.key.toUpperCase() === propName.toUpperCase());
        if (!prop) {
            return null;
        }
        return prop.value;
    }

    public create(modelKey: string, data?: any): Observable<SmartObjectDto> {
        const payload = Object.assign({ modelKey }, data);
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<SmartObjectDto>(`${this.api}${this.serviceUrl}/`, payload, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.create(modelKey), error))
            );
    }

    public validate(smart: SmartObjectDto): Observable<boolean> {
        return of(false);
    }

    getByModel(modelKey: string, skip?: number, limit?: number, sortBy?: string, sortDesc?: string) {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    let params = '';
                    if (skip >= 0) {
                        params += `skip=${skip}&limit=${limit}`;
                    }
                    if (sortBy) {
                        params += `sort=${sortBy}`;
                        if (sortDesc) {
                            params += '&order=desc';
                        }
                    }
                    if (skip >= 0 || sortBy) {
                        params = `?${params}`;
                    }
                    return this.http.get(`${this.api}${this.serviceUrl}/model/${modelKey}${params}`, { headers });
                }),
                catchError((error) => this.handleError(this.getByModel(modelKey, skip, limit), error))
            );
    }

    public getSubDoc(uuid: string | string[], params?: PairDto[]): Observable<SmartObjectDto[]> {
        if (this.dataService.networkService.offline) {
            if (Array.isArray(uuid)) {
                return zip(...
                    uuid.map((id: string) => this.getSubDoc(id, params))
                ).pipe(map((smartObjects: SmartObjectDto[][]) => _.flatten(smartObjects)));
            }
            return this.get(uuid).pipe(
                flatMap((smartObject: SmartObjectDto) => this.browseSmartObject(smartObject)),
            );
        }
        if (Array.isArray(uuid)) {
            return this.saveAll(
                this.obsHeaders()
                    .pipe(
                        flatMap((headers: HttpHeaders) => this.http.post<SmartObjectDto[]>(
                            `${this.api}${this.serviceUrl}/subdoc${this.buildQueryRoute(params)}`, uuid, { headers })),
                        catchError((error: HttpErrorResponse) => this.handleError(this.getSubDoc(uuid, params), error))
                    ),
            );
        }
        return this.saveAll(
            this.obsHeaders()
                .pipe(
                    flatMap((headers: HttpHeaders) => this.http.get<SmartObjectDto[]>(
                        `${this.api}${this.serviceUrl}/subdoc/${uuid}${this.buildQueryRoute(params)}`, { headers })),
                    catchError((error: HttpErrorResponse) => this.handleError(this.getSubDoc(uuid, params), error))
                ),
        );
    }

    private browseSmartObject(smartObject: SmartObjectDto, smartObjects: SmartObjectDto[] = []) {

        // null or recursive
        if (!smartObject || _.find(smartObjects, (so) => so.uuid === smartObject.uuid)) {
            return of(smartObjects);
        }

        const smartModel = _.find(this.settingsDataService.smartmodels, (sm) => sm.key === smartObject.modelKey);
        if (!smartModel) {
            throw new Error(`smart model ${smartObject.modelKey} not found`);
        }

        smartObjects.push(smartObject);

        const smartObjects$: Observable<SmartObjectDto[]>[] = _.reduce(smartModel.properties, (results, prop) => {
            const propInstance = smartObject.properties.find((p) => p.key.toUpperCase() === prop.key.toUpperCase());
            if (propInstance) {
                const values = prop.multiple ? propInstance.value : [propInstance.value];
                _.each(values, (v) => {
                    if (v && prop.keyType.startsWith('so:')) {
                        results.push(
                            this.dataService.get<SmartObjectDto>(this.prefix, v).pipe(
                                catchError(() => of(null)),
                                flatMap((so: SmartObjectDto) => {
                                    return this.browseSmartObject(so, smartObjects);
                                }),
                                first(),
                            )
                        );
                    }
                });
            }
            return results;
        }, []);

        const result$ = smartObjects$.length > 0 ? concat(...smartObjects$).pipe(toArray()) : of([]);
        return result$.pipe(map(() => smartObjects));
    }

    public searchByModel(modelKey: string, skip: number, take: number, sort: string, sortSelector, sortDesc): Observable<SmartObjectDto[]> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    let params = '?';

                    params += 'skip=' + (skip / take);
                    params += '&limit=' + take;

                    if (sort) {
                        params += '&sort=' + sortSelector;
                        if (sortDesc) {
                            params += '&order=desc';
                        }
                    }
                    return this.http.get<SmartObjectDto[]>(`${this.api}${this.serviceUrl}/model/${modelKey}` + params, { headers });
                }),
                catchError((error: HttpErrorResponse) =>
                    this.handleError(this.searchByModel(modelKey, skip, take, sort, sortSelector, sortDesc), error))
            );
    }

    public getSmartObjectsByUuid(uuids: string[]) {
        return uuids.length === 0 ? of([]) : zip(...uuids.map((id) => this.get(id)));
    }

    public searchByProperty(modelKey: string, property?: string, value?: string, params?: PairDto[]): Observable<SmartObjectDto[]> {
        const _params: PairDto[] = params ? [...params] : [];
        if (property) {
            _params.push({ key: 'property', value: property });
        }
        if (value) {
            _params.push({ key: 'value', value: value });
        }

        if (this.dataService.networkService.offline) {
            return this.getRoute(`${this.serviceUrl}/search/${modelKey}`, _params).pipe(
                mergeMap((uuids: string[]) => this.getSmartObjectsByUuid(uuids)),
            );
        }
        return this.saveAll(
            this.obsHeaders()
                .pipe(
                    flatMap((headers: HttpHeaders) =>
                        this.http.get<SmartObjectDto[]>(`${this.api}${this.serviceUrl}/search/${modelKey}${this.buildQueryRoute(_params)}`,
                            { headers })),
                    catchError((error: HttpErrorResponse) => this.handleError(this.searchByProperty(modelKey, property, value), error))
                ),
        ).pipe(
            mergeMap((smartObjects: SmartObjectDto[]) => {
                if (!this.dataService.active) {
                    return of(smartObjects);
                }
                return this.saveRoute(`${this.serviceUrl}/search/${modelKey}`, _params,
                    smartObjects.map((smartObject) => smartObject.uuid)).pipe(
                        map(() => smartObjects)
                    )
            })
        );
    }

    public searchBySkill(skill: string, modelKey: string, layersKey: string, set: number, skip: number,
        limit: number, sort: string, order: string, property: string, value: string): Observable<SmartObjectDto[]> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    let url = `${this.api}${this.serviceUrl}/skill/${skill}/model/${modelKey}?set=${set}&skip=${skip}`;
                    url = url + `&limit=${limit}&property=${property}&value=${value}`;
                    url = layersKey ? url + `&layers=${layersKey}` : url;
                    url = sort ? url + `&sort=${sort}` : url;
                    url = order ? url + `&order=${order}` : url;
                    return this.http.get<SmartObjectDto[]>(url, { headers });
                }),
                catchError((error: HttpErrorResponse) =>
                    this.handleError(
                        this.searchBySkill(skill, modelKey, layersKey, set, skip, limit, sort, order, property, value),
                        error
                    )
                )
            );
    }

    public searchBySkillFilter(skill: string, modelKey: string, layersKey: string, set: number, skip: number,
        limit: number, sort: string, order: string, property: string, value: string,
        filterFields: string, filtervalue: string): Observable<SmartObjectDto[]> {

        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    let url = `${this.api}${this.serviceUrl}/filterskill/${skill}/model/${modelKey}?set=${set}&skip=${skip}&limit=${limit}`;
                    url = url + `&property=${property}&value=${value}&filter=${filtervalue}&fields=${filterFields}`;
                    url = layersKey ? url + `&layers=${layersKey}` : url;
                    url = sort ? url + `&sort=${sort}` : url;
                    url = order ? url + `&order=${order}` : url;
                    return this.http.get<SmartObjectDto[]>(url, { headers });
                }),
                catchError((error: HttpErrorResponse) =>
                    this.handleError(
                        this.searchBySkill(skill, modelKey, layersKey, set, skip, limit, sort, order, property, value),
                        error
                    )
                )
            );
    }

    public listPropertyValues(modelKey: string, property: string, skip: number,
        take: number, sort?: string, startwith?: string): Observable<string[]> {
        let url = `${this.api}${this.serviceUrl}/property/${modelKey}?property=${property}&skip=${skip}&limit=${take}`;
        url = sort ? url + `&order=${sort}` : url;
        url = startwith ? url + `&startwith=${startwith}` : url;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<string[]>(url, { headers })),
                catchError((error: HttpErrorResponse) =>
                    this.handleError(this.listPropertyValues(modelKey, property, skip, take, sort, startwith), error))
            );
    }

    public listPropertyValuesES(modelKey: string, property: string, skip: number,
        take: number, sort?: string, startwith?: string): Observable<PairDto[]> {
        let url = `${this.api}${this.serviceUrl}/values/${modelKey}?property=${property}&skip=${skip}&limit=${take}`;
        url = sort ? url + `&order=${sort}` : url;
        url = startwith ? url + `&startwith=${startwith}` : url;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<string[]>(url, { headers })),
                catchError((error: HttpErrorResponse) =>
                    this.handleError(this.listPropertyValuesES(modelKey, property, skip, take, sort, startwith), error)
                ),
                map((listElements: string[]) => {
                    return this.transformDisplayService.validateNameFromList(modelKey, property, listElements);
                })
            );
    }

    public querySearch(query: QuerySearchDto, skip: number, take: number, target?: string): Observable<QuerySearchResultDto[]> {
        const url = target ?
            `${this.api}/search?skip=${skip}&limit=${take}&target=${target}` :
            `${this.api}/search?skip=${skip}&limit=${take}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<QuerySearchResultDto[]>(url, query, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.querySearch(query, skip, take), error))
            );
    }

    public QuerySearchSO(query: SearchSODto, skip?: number, limit?: number, search?: string, saveStorage = false): Observable<SmartObjectDto[]> {
        if (this.dataService.networkService.offline) {
            return this.getRoute(`${this.serviceUrl}/search/smart-objects/${query.modelKey}`, [{key: 'query', value: query}]).pipe(
                mergeMap((uuids: string[]) => this.getSmartObjectsByUuid(uuids)),
            );
        }
        const params: PairDto[] = [];
        if (skip != null) {
            params.push({ key: 'skip', value: skip })
        }
        if (limit != null) {
            params.push({ key: 'limit', value: limit })
        }
        if (search != null) {
            params.push({ key: 'search', value: search })
        }
        const url = `${this.api}/search/smart-objects${this.buildQueryRoute(params)}`;
        const request$ = this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<SmartObjectDto[]>(url, query, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.QuerySearchSO(query, skip, limit, search), error))
            );

        return !saveStorage ? request$ : this.saveAll(request$).pipe(
            mergeMap((smartObjects: SmartObjectDto[]) => {
                if (!this.dataService.active) {
                    return of(smartObjects);
                }
                return this.saveRoute(`${this.serviceUrl}/search/smart-objects/${query.modelKey}`, [{key: 'query', value: query}],
                    smartObjects.map((smartObject) => smartObject.uuid)).pipe(
                        map(() => smartObjects)
                    )
            })
        );
    }

    public getMagnets(appKey: string, boardInstance?: string, zoneKey?: string): Observable<SmartObjectDto[]> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    return this.http.post<SmartObjectDto[]>(`${this.api}${this.serviceUrl}/magnets`, { appKey, boardInstance, zoneKey },
                        { headers });
                }),
                catchError((error: HttpErrorResponse) => this.handleError(this.getMagnets(appKey, boardInstance, zoneKey), error))
            );
    }

    private getModelFromKey(modelKey: string): Observable<any> {
        return of(null);
    }

    _decodeB64(b64: string, fileName: string, fileType: string): File {
        const byteCharacters = window.atob(b64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new File([byteArray], fileName, { type: fileType });
    }

    private _uploadFile(uuid: string, info: FileUploadDto, fileName?: string, file?: Blob) {
        const formData: FormData = new FormData();

        if (file && fileName) {
            formData.append('file', file, fileName);
        }
        formData.append('reason', info.reason);
        formData.append('documentID', info.documentID);
        formData.append('versionID', info.versionID);
        formData.append('userID', info.userID);
        formData.append('tags', info.tags);
        formData.append('metadatas', info.metadatas);

        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    let newHeaders = _.cloneDeep(headers);
                    newHeaders = newHeaders.delete('Content-Type');
                    newHeaders = newHeaders.delete('Accept');

                    return this.http.post(`${this.api}/files/smart-object/${uuid}`, formData,
                        {
                            headers: newHeaders,
                        },
                    );
                }),
                catchError((error: HttpErrorResponse) => this.handleError(this._uploadFile(uuid, info, fileName, file), error))
            );
    }

    public signature(file: File | string, fileName: string, fileType: string, uuid: string, info: ATSignatureDto):
        Observable<SmartObjectDto> {
        const _file: File = file instanceof File ? file : this._decodeB64(file, fileName, fileType);
        const formData: FormData = new FormData();

        if (_file) {
            formData.append('file', _file, _file.name);
        }
        formData.append('date', info.date);
        formData.append('signatureID', info.signatureID);
        formData.append('userID', info.userID);

        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    let newHeaders = _.cloneDeep(headers);
                    newHeaders = newHeaders.delete('Content-Type');
                    newHeaders = newHeaders.delete('Accept');

                    return this.http.post(`${this.api}/files/signature/${uuid}`, formData,
                        {
                            headers: newHeaders,
                        },
                    );
                }),
                catchError((error: HttpErrorResponse) => this.handleError(this.signature(file, fileName, fileType, uuid, info), error))
            );
    }

    downloadFile(id: string, byUUID = false, download = false) {

        const token = this.authService.localProfil.key;

        const link = `${this.api}/files/${id}?jwt=${token}${byUUID ?
            '&byUUID=1' : ''}${download ? '&download=1' : ''}`;

        if (download) {
            window.location.href = link;
        } else {
            window.open(link);
        }
    }

    uploadFile(file: Blob | string, fileName: string, fileType: string, uuid: string, info: FileUploadDto): Observable<SmartObjectDto> {
        const _file = file instanceof Blob ? file : this._decodeB64(file, fileName, fileType);
        return this._uploadFile(uuid, info, fileName, _file);
    }

    linkFile(uuid: string, info: FileUploadDto): Observable<SmartObjectDto> {
        return this._uploadFile(uuid, info);
    }

    removeDocument(data: { uuid: string, documentID?: string | string[], versionID?: string | string[] }): Observable<SmartObjectDto> {
        const url = `${this.api}/files/smart-object`;
        const versionsID = !data.versionID || _.isArray(data.versionID) ? data.versionID : [data.versionID];
        const documentsID = !data.documentID || _.isArray(data.documentID) ? data.documentID : [data.documentID];
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.request('delete', url,
                    { headers, body: { uuid: data.uuid, versionsID, documentsID } })),
                catchError((error: HttpErrorResponse) => this.handleError(this.removeDocument(data), error))
            );
    }

    editDocument(uuid: string, edit: FileEditDto): Observable<SmartObjectDto> {
        const url = `${this.api}/files/smart-object/${uuid}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.put<SmartObjectDto>(`${url}`, edit, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.editDocument(uuid, edit), error))
            );
    }

    getDocuments(smartObject: SmartObjectDto, params?: PairDto[]): Observable<DocumentDto[]> {
        return this.documentsService.getBySmartObject(smartObject, params);
    }

    getSmartObjectsByDocument(uuid: string): Observable<SmartObjectDto[]> {
        if (this.dataService.networkService.offline) {
            // find all smartobjects contains document uuid
            return this.dataService.getAll(this.prefix).pipe(
                map((smartObjects: SmartObjectDto[]) => {
                    return _.filter(smartObjects, (smartObject: SmartObjectDto) => {
                        if (!smartObject.skills || !smartObject.skills.atDocument || !smartObject.skills.atDocument.documents) {
                            return false;
                        }

                        return smartObject.skills.atDocument.documents.indexOf(uuid) > -1;
                    });
                })
            );
        }

        return this.saveAll(
            this.obsHeaders()
                .pipe(
                    flatMap((headers: HttpHeaders) => this.http.get<any>(
                        `${this.api}${this.serviceUrl}/doc/${uuid}`, { headers })),
                    catchError((error: HttpErrorResponse) => this.handleError(this.getSmartObjectsByDocument(uuid), error))
                )
        );
    }

    saveAll(get: Observable<SmartObjectDto[]>): Observable<SmartObjectDto[]> {
        return this.dataService.saveAll<SmartObjectDto>(get, this.prefix, this.keyName);
    }

    unique(smartObject: SmartObjectDto): Observable<boolean> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post(`${this.api}${this.serviceUrl}/unique`,
                    smartObject, { headers })),
                map((res: { unique: boolean }) => res.unique),
                catchError((error: HttpErrorResponse) => this.handleError(this.unique(smartObject), error))
            );
    }

    removeFromLayer(layerKey: string): Observable<any> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    return this.http.get<any>(`${this.api}${this.serviceUrl}/layer-remove/${layerKey}`, { headers });
                }),
                catchError((error: HttpErrorResponse) => this.handleError(this.removeFromLayer(layerKey), error)),
            );
    }

    countSos(query: SearchSODto): Observable<number> {
        const url = `${this.api}${this.serviceUrl}/count`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<number>(url, query, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.countSos(query), error))
            );
    }

    indexDoc(params: PairDto[]): Observable<number> {
        const url = `${this.api}${this.serviceUrl}/doc/indexation${this.buildQueryRoute(params)}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    return this.http.post<number>(url, {}, { headers })
                }),
                catchError((error: HttpErrorResponse) => this.handleError(this.indexDoc(params), error))
            );
    }

    indexSos(options: IndexationOptionsDto, empty?): Observable<number> {
        const url = `${this.api}${this.serviceUrl}/so/indexation${empty ? this.buildQueryRoute([{ key: 'empty', value: 'true' }]) : ''}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<number>(url, options, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.indexSos(options), error))
            );
    }

    deleteSos(options: DeleteDto, modelKey: string, deleted: boolean, notIndexed: boolean): Observable<number> {
        const url = `${this.api}${this.serviceUrl}/sos${this.buildQueryRoute([
            { key: 'modelKey', value: modelKey },
            { key: 'deleted', value: deleted },
            { key: 'notIndexed', value: notIndexed }])}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.request('delete', url,
                    { headers, body: options })),
                catchError((error: HttpErrorResponse) => this.handleError(this.deleteSos(options, modelKey, deleted, notIndexed), error))
            );
    }

    retoreObjects(uuids: string[], modelKey: string): Observable<boolean> {
        const url = `${this.api}${this.serviceUrl}/so/restore${this.buildQueryRoute([{ key: 'modelKey', value: modelKey }])}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<boolean>(url, uuids, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.retoreObjects(uuids, modelKey,), error))
            );
    }

    update(smartObject: SmartObjectDto) {
        const url = `${this.api}${this.serviceUrl}`;
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.put<boolean>(url, smartObject, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.update(smartObject), error))
            );
    }

}

