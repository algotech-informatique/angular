import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class RxExtendService {

    sequence(arr: Observable<any>[], previous: Observable<any> = null, values: any[] = []): Observable<any[]> {
        if (arr.length === 0) {
            if (!previous) {
                return of([]);
            }
            return previous.pipe(map((ret) => {
                values.push(ret);
                return values;
            }));
        }
        const currentObs = arr.shift();
        if (previous) {
            return previous.pipe(flatMap((ret: any) => {
                values.push(ret);
                return this.sequence(arr, currentObs, values);
            }));
        } else {
            return this.sequence(arr, currentObs, values);
        }
    }
}
