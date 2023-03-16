import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EmailService } from './email.service';

@NgModule({
    imports: [
        HttpClientModule
    ],
    providers: [
        EmailService
    ]
})
export class EmailModule { }
