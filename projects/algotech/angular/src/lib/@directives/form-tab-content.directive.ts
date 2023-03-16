import { Directive, Injectable, Input, OnInit, TemplateRef, ViewContainerRef, SimpleChanges, OnChanges } from '@angular/core';

@Injectable()
@Directive({ selector: '[at-form-tab-content]' })
export class FormTabContentDirective implements OnChanges {

    @Input() visible: boolean = false;

    constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['visible']) {
            this.switchVisibility();
        }
    }

    public setVisible(v: boolean) {
        if (this.visible !== v) {
            this.visible = v;
            this.switchVisibility();
        }
    }

    private switchVisibility() {
        if (this.visible === true) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}