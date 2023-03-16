import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { flatMap } from 'rxjs/operators';
import { PatchPropertyDto, PairDto } from '@algotech/core';
import * as _ from 'lodash';
import { EnvService } from './env.service';

@Injectable()
export abstract class BaseService<T> {
    api: string;

    protected serviceUrl = '/';
    protected errorResponse: 'object' | 'formatted' = 'formatted';

    constructor(
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService) {

        env.environment.subscribe((e) => this.api = e.API_URL);
    }

    public list(params?: PairDto[]): Observable<T[]> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => {
                    return this.http.get<T[]>(`${this.api}${this.serviceUrl}${this.buildQueryRoute(params)}`, { headers });
                }),
                catchError((error: HttpErrorResponse) => this.handleError(this.list(params), error))
            );
    }

    public get(id: string, params?: PairDto[]): Observable<T> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<T>(`${this.api}${this.serviceUrl}/${id}${this.buildQueryRoute(params)}`,
                    { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.get(id, params), error))
            );
    }

    public delete(uuid: string): Observable<{}> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.request('delete', '' +
                    this.api + this.serviceUrl, { headers, body: { uuid } })),
                catchError((error: HttpErrorResponse) => this.handleError(this.delete(uuid), error))
            );
    }
    public post(entity: T): Observable<T> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.post<T>(`${this.api}${this.serviceUrl}`, entity, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.post(entity), error))
            );
    }
    public put(entity: T): Observable<T> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.put<T>(`${this.api}${this.serviceUrl}`, entity, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.put(entity), error))
            );
    }

    public patch(uuid: string, body: any): Observable<T> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.patch<T>(`${this.api}${this.serviceUrl}/${uuid}`, body, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.patch(uuid, body), error))
            );
    }

    public patchProperty(id: string, patches: PatchPropertyDto[]): Observable<PatchPropertyDto[]> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.patch<T>(`${this.api}${this.serviceUrl}/${id}`, patches, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.patch(id, patches), error))
            );
    }

    protected obsHeaders(): Observable<HttpHeaders> {

        return new Observable((observer) => {
            let key: String = '';
            if (this.authService.isAuthenticated) {
                key = this.authService.localProfil.key;
            } else {
                console.log('not authenticated');
            }

            let headers = new HttpHeaders();
            headers = headers.append('Accept', 'application/json');
            headers = headers.append('Content-Type', 'application/json');
            headers = headers.append('Authorization', `Bearer ${key}`);
            observer.next(headers);
        });
    }

    protected getError(error: HttpErrorResponse) {
        if (this.errorResponse === 'object') {
            return error;
        }

        let message = error.message;
        if (error instanceof HttpErrorResponse && error.error?.message) {
            const value = error.error.message;
            message = _.isObject(value) ? JSON.stringify(value) : value;
        }
        const err: Error = new Error(`${message}`);
        return err;
    }

    protected handleError(req: Observable<any>, error: HttpErrorResponse): Observable<any> {

        if (error.status === 401) {
            return this.authService.logout(false);
        } else  if (error.status === 304) {
            return throwError(error);
        } else {
            return throwError(this.getError(error));
        }
    }

    
    public buildQueryRoute(params?: PairDto[]) {
        return params ?
            _.reduce(params, (result, param) => {
                result = result === '' ? '?' : `${result}&`;
                result = `${result}${param.key}=${param.value}`;
                return result;
            }, '') : '';
    }

    // public upload(file: File): Observable<{}> {
    //     let formData: FormData = new FormData();
    //     formData.append('file', file, file.name);
    //     let headers = this.buildUploadHeaders();
    //     return this.http.post(`${this.API_URL}/assets`, formData, { headers })
    //         .map((res) => this.castResponse<{}>(res))
    //         .catch((error: Response) => this.handleError('POST', `${this.API_URL}/assets`, error));
    // }
    // private buildUploadHeaders() {
    //     let connectedUser = JSON.parse(localStorage.getItem(this.LS_KEY));
    //     let headers = new Headers();
    //     headers.append('Accept', 'application/json');
    //     headers.append('X-Auth-Token', connectedUser.token);
    //     return headers;
    // }
}
