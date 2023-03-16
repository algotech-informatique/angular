import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';
import { ATAngularModule, AuthModule, AuthService, I18nService } from '../../projects/algotech/angular/src/public_api';
import { environment } from 'environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { EnvService } from '../../projects/algotech/angular/src/lib/base/env.service';
import { KeycloakAngularModule } from 'keycloak-angular';
import { APP_BASE_HREF, PlatformLocation } from '@angular/common';

export function EnvInitialize(env: EnvService, authService: AuthService, i18n: I18nService) {
    return async () => {
        i18n.init('fr-FR', ['fr-FR']);
        return await new Promise((resolve) => {
            env.initialize(environment);
            authService.appId = environment.APP_ID;
            authService.initialize('pwa-player', window.location.origin, environment.KC_URL).pipe(
            ).subscribe(() => {
                const connected = authService.isAuthenticated;
                if (!connected) {
                    authService.redirectUri = authService.origin;
                    authService.signin().subscribe(() => {
                        resolve(true);
                    });
        
                } else {
                    authService.loggedIn.next(null);
                    resolve(true);
                }
            });
        });
    };
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AuthModule,
        KeycloakAngularModule,
        TranslateModule.forRoot(),
        ATAngularModule.forRoot()
    ],
    providers: [
        I18nService,
        {
            provide: APP_INITIALIZER,
            useFactory: EnvInitialize,
            deps: [EnvService, AuthService, I18nService],
            multi: true
        },
        {
            provide: APP_BASE_HREF,
            useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
            deps: [PlatformLocation]
        },],
    bootstrap: [AppComponent]
})
export class AppModule { }
