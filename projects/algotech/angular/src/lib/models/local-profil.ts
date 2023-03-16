import { UserDto } from '@algotech/core';

export class LocalProfil {
    id: string;
    key: string;
    refresh: string;
    login: string;
    email: string;
    firstName: string;
    lastName: string;
    pictureUrl: string;
    preferedLang: string;
    groups: string[];
    password: string;
    user: UserDto;
}
