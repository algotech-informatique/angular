import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakAuthGuard } from 'keycloak-angular';
import { AuthService } from './auth.service';

@Injectable()
export class SignInGuard extends KeycloakAuthGuard {


    constructor(
        protected readonly router: Router,
        private authService: AuthService,
    ) {
        super(router, authService.keycloakService);
    }

    async isAccessAllowed(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean | UrlTree> {

        if (!this.authService.isAuthenticated) {
            this.authService.redirectUri = this.authService.origin + state.url;
            await this.authService.signin();

            return false;
        } else {

            this.authService.loggedIn.next(null);

            const requiredGroups = route.data.groups;
            // Allow the user to to proceed if no additional groups are required to access the route.
            if (!(requiredGroups instanceof Array) || requiredGroups.length === 0) {
                return true;
            }
            // Allow the user to proceed if one of the required groups are present.
            const isAuthorized = requiredGroups.some((group) => this.authService.localProfil.groups.includes(group));
            if (route.data.redirectUrl && !isAuthorized) {
                this.router.navigateByUrl(route.data.redirectUrl);
            }

            return isAuthorized;
        }

    }
}
