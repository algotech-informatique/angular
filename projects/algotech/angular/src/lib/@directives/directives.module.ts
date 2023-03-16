import { NgModule } from '@angular/core';
import { FormTabContentDirective } from './form-tab-content.directive';
import { ClickOutsideDirective } from './click-outside.directive';
import { WsFocusDirective } from './ws-focus-directive';
import { TooltipsDirective } from './tooltips.directive';
import { FadeInOutDirective } from './animations/fade-in-out.directive';

@NgModule({
    declarations: [
        WsFocusDirective,
        FormTabContentDirective,
        ClickOutsideDirective,
        TooltipsDirective,
        FadeInOutDirective,
    ],
    imports: [
    ],
    exports: [
        WsFocusDirective,
        FormTabContentDirective,
        ClickOutsideDirective,
        TooltipsDirective,
        FadeInOutDirective,
    ],
})
export class DirectivesModule { }
