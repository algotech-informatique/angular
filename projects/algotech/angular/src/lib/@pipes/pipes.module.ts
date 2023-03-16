import { NgModule } from '@angular/core';
import { TranslateLangDtoPipe } from './translate-lang-dto.pipe';
import { TranslateLangDtoService } from '../@services/translate-lang-dto.service';
import { FirstUpperCasePipe } from './first-upper-case.pipe';
import { LinkPipe } from './link.pipe';
import { TruncatePipe } from './truncate.pipe';
import { LocaleDatePipe } from './locale-date.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { DisplaySOPipe } from './display-so.pipe';
import { DisplaySMPipe } from './display-sm.pipe';
import { SafePipe } from './safe.pipe';
import { SafeHtmlPipe } from './safehtml.pipe';
import { SplitPipe } from './split.pipe';
import { FindPipe } from './find.pipe';
import { IncludesPipe } from './includes.pipe';
import { FilterPipe } from './filter.pipe';
import { DateFormatPipe } from './date.format.pipe';

@NgModule({
    declarations: [
        LocaleDatePipe,
        TranslateLangDtoPipe,
        FirstUpperCasePipe,
        LinkPipe,
        TruncatePipe,
        DisplaySOPipe,
        DisplaySMPipe,
        SafePipe,
        SafeHtmlPipe,
        SplitPipe,
        FindPipe,
        IncludesPipe,
        FilterPipe,
        DateFormatPipe
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        LocaleDatePipe,
        TranslateLangDtoPipe,
        FirstUpperCasePipe,
        LinkPipe,
        TruncatePipe,
        DisplaySOPipe,
        DisplaySMPipe,
        SafePipe,
        SafeHtmlPipe,
        SplitPipe,
        FindPipe,
        IncludesPipe,
        FilterPipe,
        DateFormatPipe
    ],
    providers: [
        DatePipe,
        TranslateLangDtoService,
    ]
})
export class PipesModule { }
