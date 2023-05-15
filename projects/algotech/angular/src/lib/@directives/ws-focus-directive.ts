import { Directive, ElementRef, Input, Output, EventEmitter, DoCheck, HostListener, AfterContentInit } from '@angular/core';
import { WsUserDto } from '@algotech-ce/core';
import { WS_USERS_COLORS } from '../mocks/mock-ws-user-color';

const COLOR_DEFAULT = '#000000';

@Directive({
    selector: '[ws-focus]'
})
export class WsFocusDirective implements DoCheck, AfterContentInit {
    @Input() zone = '';
    @Input('ws-focus') focus: WsUserDto[] = [];
    @Output() onFocus = new EventEmitter();

    constructor(private el: ElementRef) {
    }
    ngAfterContentInit() {
        this.el.nativeElement.style.borderWidth = '3px';
    }
    ngDoCheck() {
        let color = '';
        for (const aUser of this.focus) {
            if (aUser.focus.zone === this.zone) {
                //
                color = COLOR_DEFAULT;
                if (aUser.color < WS_USERS_COLORS.length) {
                    color = WS_USERS_COLORS[aUser.color];
                }
            }
        }
        if (color !== '') {
            this.el.nativeElement.style.borderColor = color;
            this.el.nativeElement.style.borderStyle = 'solid';
        } else {
            this.el.nativeElement.style.borderStyle = 'none';
        }
    }

    @HostListener('click')
    public onClickin(): void {
        this.onFocus.emit(this.zone);
    }
}
