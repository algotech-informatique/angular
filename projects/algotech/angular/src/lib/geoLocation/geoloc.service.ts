import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, flatMap, mergeMap } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Geolocation, Position } from '@capacitor/geolocation';

@Injectable()
export class GeoLocationService {

    constructor(
        private toastController: ToastController,
        private translate: TranslateService,
    ) {}

    async geolocToast(toastMessage: string) {
        const toast = await this.toastController.create({
            message: toastMessage,
            duration: 2000
        });
        toast.present();
        
    }
    
    checkGPSPermission(options?: PositionOptions): Observable<Position> {
        this.geolocToast(this.translate.instant('GEOLOCATION.PROGRESS'));

        return from(Geolocation.checkPermissions()).pipe(
            flatMap((result) => {
                if (result.location !== 'denied') {
                    return this.getPosition(options);
                } else {
                    return from(Geolocation.requestPermissions()).pipe(
                        mergeMap(() => this.getPosition(options))
                    );
                }
            })
        );
    }

    getPosition(options?: PositionOptions): Observable<Position> {
        return from(Geolocation.getCurrentPosition(options)).pipe(
            catchError((error) => {
                this.geolocToast(this.translate.instant('GEOLOCATION.ERROR_CONNECT'));
                return throwError(error);
            }),
        );
    }
}
