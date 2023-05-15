import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, zip } from 'rxjs';
import { catchError, flatMap, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { DocumentDto, PairDto, SmartObjectDto } from '@algotech-ce/core';
import { AuthService } from '../auth/auth.service';
import { BaseCacheService } from '../base/base.cache.service';
import { DataService } from '../base/data-service';
import { EnvService } from '../base/env.service';

@Injectable()
export class DocumentsService extends BaseCacheService<DocumentDto> {

    constructor(
        protected dataService: DataService,
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService
    ) {
        super(dataService, authService, http, env);

        this.prefix = '$document';
        this.serviceUrl = '/documents';
    }

    public getBySmartObject(smartObject: SmartObjectDto, params?: PairDto[]): Observable<DocumentDto[]> {
        if (!this.dataService.networkService.offline) {
            const url = `${this.api}/documents/so/${smartObject.uuid}${this.buildQueryRoute(params)}`;
            return this.dataService.saveAll(
                this.obsHeaders()
                    .pipe(
                        flatMap((headers: HttpHeaders) => this.http.get<any>(url, { headers })),
                        catchError((error: HttpErrorResponse) =>
                            this.handleError(this.getBySmartObject(smartObject, params), error))
                    ),
                this.prefix,
                this.keyName
            );
        } else {
            if (!smartObject.skills || !smartObject.skills.atDocument || !smartObject.skills.atDocument.documents) {
                return of([]);
            }

            const obsDocument: Observable<DocumentDto>[] =
                _.map((smartObject.skills.atDocument.documents), (document: string) => {
                    return this.dataService.get<DocumentDto>(this.prefix, document);
                });

            return obsDocument.length > 0 ? zip(...obsDocument).pipe(
                map((documents: DocumentDto[]) => {
                    return _.compact(documents);
                })
            ) : of([]);
        }
    }

    public getByUuids(uuids: string[]): Observable<DocumentDto[]> {
        if (!this.dataService.networkService.offline) {
            return this.dataService.saveAll(this.obsHeaders()
                .pipe(
                    flatMap((headers: HttpHeaders) => this.http.post<DocumentDto[]>(
                        `${this.api}${this.serviceUrl}/uuids`, uuids, { headers })),
                    catchError((error: HttpErrorResponse) => this.handleError(this.getByUuids(uuids), error))
                ),
                this.prefix,
                this.keyName
            );
        } else {
            const obsDocument: Observable<DocumentDto>[] =
                _.map((uuids), (uuid: string) => {
                    return this.dataService.get<DocumentDto>(this.prefix, uuid);
                });

            return obsDocument.length > 0 ? zip(...obsDocument).pipe(
                map((documents: DocumentDto[]) => {
                    return _.compact(documents);
                })
            ) : of([]);
        }
    }

    public getByName(name: string): Observable<DocumentDto> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<DocumentDto>(`${this.api}${this.serviceUrl}/name/${name}`, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.getByName(name), error))
            );
    }

    public getRecent(): Observable<DocumentDto[]> {
        if (!this.dataService.networkService.offline) {
            return this.dataService.saveAll(this.obsHeaders()
                .pipe(
                    flatMap((headers: HttpHeaders) => this.http.get<DocumentDto[]>(
                        `${this.api}${this.serviceUrl}/recent`, { headers })),
                    catchError((error: HttpErrorResponse) => this.handleError(this.getRecent(), error))
                ),
                this.prefix,
                this.keyName
            );
        } else {
            return this.dataService.getAll(this.prefix).pipe(
                map((documents: DocumentDto[]) => {

                    // return doc and date of first version
                    const documentsAndDate = _.reduce(documents, (results, document: DocumentDto) => {
                        if (document.versions.length > 0 && !_.find(results, (r) => r.uuid === document.uuid)) {
                            results.push({
                                document,
                                uuid: document.uuid,
                                date: document.versions[0].dateUpdated
                            });
                        }
                        return results;
                    }, []);

                    return _.map(
                        _.take(
                            _.orderBy(
                                documentsAndDate,
                                'date',
                                'desc'),
                            20),
                        (docAndDate) => docAndDate.document
                    );
                })
            );
        }
    }

    public uploadDocument(oFile: File, fileName: string, uuid: string): Observable<any> {
        return this._uploadFile(oFile, uuid, fileName);
    }

    private _uploadFile(oFile: File, uuid: string, fileName?: string) {
        const formData: FormData = new FormData();
        if (oFile && fileName) {
            formData.append('file', oFile, fileName);
        }

        const url = `${this.api}/files/upload/${uuid}`;
        return this.obsHeaders().pipe(
            flatMap((headers: HttpHeaders) => {
                let newHeaders = _.cloneDeep(headers);
                newHeaders = newHeaders.delete('Content-Type');
                newHeaders = newHeaders.delete('Accept');
                return this.http.post(url, formData,
                    {
                        headers: newHeaders,
                    },
                );
            }),
            catchError((error: HttpErrorResponse) => this.handleError(this._uploadFile(oFile, uuid, fileName), error))
        );

    }

}

