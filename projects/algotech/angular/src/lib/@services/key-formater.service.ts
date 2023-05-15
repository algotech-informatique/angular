import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class KeyFormaterService {

    constructor() { }

    format(inputString: string, replaceDash = false) {

        if (!inputString || inputString === '') { return ''; }

        inputString = inputString.replace(/[ŧ←↓·=→ł!@#$%^&*(),.?":{}|<>]/g, ''); // erases special caracters
        inputString = inputString.replace(replaceDash ? /\s+|\/|-/g : /\s+|\//g, '_'); // replace spaces, slash and dash by '_'
        inputString = inputString.trim();

        return _.map(inputString, (letter) => this._replaceCharacter(letter)).join('').trim();
    }

    private _replaceCharacter(character) {
        switch (character) {
            case '+': return '';
            case '~': return '';
            case '[': return '';
            case ']': return '';
            case '«': return '';
            case '»': return '';
            case '¶': return '';
            case '\r': return '';
            case '\n': return '';
            case '\t': return '';
            case '\f': return '';
            case '\v': return '';
            case '`': return '';
            case '€': return '_';
            case '‚': return '';
            case 'ƒ': return 'f';
            case '„': return '';
            case '…': return '...';
            case '†': return '_';
            case '‡': return '_';
            case 'ˆ': return '^';
            case '‰': return '';
            case 'Š': return 'S';
            case '‹': return '';
            case 'Œ': return 'OE';
            case 'Ž': return 'Z';
            case '‘': return '';
            case '’': return '';
            case '“': return '';
            case '”': return '';
            case '•': return '_';
            case '–': return '_';
            case '—': return '_';
            case '˜': return '_';
            case '™': return '';
            case 'š': return 's';
            case '›': return '';
            case 'œ': return 'ce';
            case 'ž': return 'z';
            case 'Ÿ': return 'Y';
            case '¡': return 'i';
            case '¥': return 'Y';
            case '¦': return '';
            case 'ª': return 'a';
            case '¬': return '_';
            case '¯': return '_';
            case '²': return '2';
            case '³': return '3';
            case '´': return '';
            case '¸': return '';
            case '¹': return '1';
            case 'º': return '0';
            case '¼': return '14';
            case '½': return '12';
            case '¾': return '34';
            case '¿': return '';
            case 'À': return 'A';
            case 'Á': return 'A';
            case 'Â': return 'A';
            case 'Ã': return 'A';
            case 'Ä': return 'A';
            case 'Å': return 'A';
            case 'Æ': return 'AE';
            case 'Ç': return 'C';
            case 'È': return 'E';
            case 'É': return 'E';
            case 'Ê': return 'E';
            case 'Ë': return 'E';
            case 'Ì': return 'I';
            case 'Í': return 'I';
            case 'Î': return 'I';
            case 'Ï': return 'I';
            case 'Ð': return 'D';
            case 'Ñ': return 'N';
            case 'Ò': return 'O';
            case 'Ó': return 'O';
            case 'Ô': return 'O';
            case 'Õ': return 'O';
            case 'Ö': return 'O';
            case '×': return 'x';
            case 'Ø': return 'O';
            case 'Ù': return 'U';
            case 'Ú': return 'U';
            case 'Û': return 'U';
            case 'Ü': return 'U';
            case 'Ý': return 'Y';
            case 'ß': return 'B';
            case 'à': return 'a';
            case 'á': return 'a';
            case 'â': return 'a';
            case 'ã': return 'a';
            case 'ä': return 'a';
            case 'å': return 'a';
            case 'æ': return 'ae';
            case 'ç': return 'c';
            case 'è': return 'e';
            case 'é': return 'e';
            case 'ê': return 'e';
            case 'ë': return 'e';
            case 'ì': return 'i';
            case 'í': return 'i';
            case 'î': return 'i';
            case 'ï': return 'i';
            case 'ñ': return 'n';
            case 'ò': return 'o';
            case 'ó': return 'o';
            case 'ô': return 'o';
            case 'õ': return 'o';
            case 'ö': return 'o';
            case '÷': return '';
            case 'ø': return 'o';
            case 'ù': return 'u';
            case 'ú': return 'u';
            case 'û': return 'u';
            case 'ü': return 'u';
            case 'ý': return 'y';
            case 'ÿ': return 'y';
            case '©': return '';
            case '®': return '';
            case 'đ': return 'd';
            case 'ð': return 'o';
            case '¢': return 'c';
            case 'µ': return 'u';
            case 'þ': return 'b';
            case 'ŋ': return 'n';
            default: return character;
        }
    }
}
