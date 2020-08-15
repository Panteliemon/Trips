import { PicFormat } from './picture';

export class User {
    id: number;
    name: string;
    registeredDate: Date;
    lastChangedName: Date;
    profilePicture: string;
    smallSizeProfilePicture: string;
    profilePictureFormat: PicFormat;
    isAdmin: boolean;
    canPublishNews: boolean;
    canPublishTrips: boolean;
    canEditGeography: boolean;
    isGuest: boolean;
}