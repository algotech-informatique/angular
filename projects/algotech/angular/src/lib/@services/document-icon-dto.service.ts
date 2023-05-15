import { Injectable } from '@angular/core';
import _ from 'lodash';
import { DocumentIconDto } from '@algotech-ce/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class DocumentIconDtoService {

    listIcons: DocumentIconDto[];

    constructor(
        private readonly translateService: TranslateService,
    ) { }

    initializeIcons() {
        this.listIcons = [
            {
                key: 'pdf',
                name: 'PDF',
                icon: '<i class="fa-solid fa-file-pdf"></i>',
                color: '#eb0c0c',
                extensions: [
                    '^pdf'
                ]
            },
            {
                key: 'document',
                name: this.translateService.instant('DOCUMENTS.TYPE.DOCUMENT'),
                icon: '<i class="fa-solid fa-file-word"></i>',
                color: '#295397',
                extensions: [
                    '^(doc*|odt|rtf)'
                ]
            },
            {
                key: 'picture',
                name: this.translateService.instant('DOCUMENTS.TYPE.PICTURE'),
                icon: '<i class="fa-solid fa-file-image"></i>',
                color: '#ffc12c',
                extensions: [
                    '^(png|jpg|jpeg|bmp|ico|gif|svg)'
                ]
            },
            {
                key: 'video',
                name: this.translateService.instant('DOCUMENTS.TYPE.VIDEO'),
                icon: '<i class="fa-solid fa-file-video"></i>',
                color: '#705a95',
                extensions: [
                    '^(avi|mpg|mpeg|mov|wmv|mp4)'
                ]
            },
            {
                key: 'excel',
                name: 'Excel',
                icon: '<i class="fa-solid fa-file-excel"></i>',
                color: '#228B22',
                extensions: [
                    '^xls*'
                ]
            },
            {
                key: 'powerpoint',
                name: 'Powerpoint',
                icon: '<i class="fa-solid fa-file-powerpoint"></i>',
                color: '#d24726',
                extensions: [
                    '^ppt*'
                ]
            },
            {
                key: 'csv',
                name: 'CSV',
                icon: '<i class="fa-solid fa-file-csv"></i>',
                color: '#228B22',
                extensions: [
                    '^csv'
                ]
            },
            {
                key: 'text',
                name: this.translateService.instant('DOCUMENTS.TYPE.TEXT'),
                icon: '<i class="fa-solid fa-file-lines"></i>',
                color: '#568082',
                extensions: [
                    '^txt'
                ]
            },
            {
                key: 'zip',
                name: 'ZIP',
                icon: '<i class="fa-solid fa-file-zipper"></i>',
                color: '#2F4F4F',
                extensions: [
                    '^(zip|rar|tgz|tar|7z)'
                ]
            },
            {
                key: 'audio',
                name: this.translateService.instant('DOCUMENTS.TYPE.AUDIO'),
                icon: '<i class="fa-solid fa-file-audio"></i>',
                color: '#aa5a6f',
                extensions: [
                    '^(mp3|wav|midi|wma)'
                ]
            },
            {
                key: 'algotech',
                name: 'Algotech',
                icon: '<i class="fa-solid fa-file"></i>',
                color: '#f05e05',
                extensions: [
                    '^(ele|elejson|dwg|dxf)'
                ]
            },
            {
                key: 'default',
                name: 'Default',
                icon: '<i class="fa-solid fa-file"></i>',
                color: '#757575',
                extensions: [
                    '.*'
                ]
            }
        ];
    }

    getDocumentIcon(extension: string): DocumentIconDto {
        if (!this.listIcons) {
            this.initializeIcons();
        }

        let docIcon: DocumentIconDto = _.find(this.listIcons, (li: DocumentIconDto) => {
            const regex = RegExp(li.extensions[0], 'i');
            return regex.test(extension);
        });

        if (!docIcon) {
            docIcon = _.filter(this.listIcons, (ls) => ls.name.toUpperCase() === 'DEFAULT')[0];
        }

        return docIcon;
    }

}
