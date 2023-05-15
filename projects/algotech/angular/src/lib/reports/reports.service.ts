import { Injectable, Inject } from '@angular/core';
import { BaseService } from '../base/base.service';
import { ReportPreviewDto, ReportGenerateDto } from '@algotech-ce/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { flatMap, catchError } from 'rxjs/operators';
import { EnvService } from '../base/env.service';

@Injectable()
export class ReportsService extends BaseService<any> {

    constructor(protected authService: AuthService, protected http: HttpClient, protected env: EnvService) {
        super(authService, http, env);
        this.serviceUrl = '/reports';
    }

    public listReports(): Observable<string[]> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) => this.http.get<string[]>(`${this.api}${this.serviceUrl}`, { headers })),
                catchError((error: HttpErrorResponse) => this.handleError(this.listReports(), error))
            );
    }

    public generateReports(data: ReportGenerateDto): Observable<Blob> {
        return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) =>
                    this.http.post(`${this.api}${this.serviceUrl}/generate`, data, { headers, responseType: 'blob' })),
                catchError((error: HttpErrorResponse) => this.handleError(this.generateReports(data), error))
            );
    }

    public previewReports(data: ReportPreviewDto): Observable<Blob> {
         return this.obsHeaders()
            .pipe(
                flatMap((headers: HttpHeaders) =>
                this.http.post(`${this.api}${this.serviceUrl}/preview`, data, { headers, responseType: 'blob' })
                ), catchError((error: HttpErrorResponse) => this.handleError(this.previewReports(data), error))
            );
     }
}
