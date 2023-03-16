import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AuthAdminService } from './auth-admin.service';
import { KeycloakService } from 'keycloak-angular';

@NgModule({
    imports: [
        HttpClientModule
    ],
    providers: [
        AuthService,
        AuthAdminService,
        KeycloakService,
    ]
})
export class AuthModule { }
