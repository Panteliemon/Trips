export class User {
    id: number;
    name: string;
    registeredDate: Date;
    lastChangedName: Date;
    profilePicture: string;
    smallSizeProfilePicture: string;
    isAdmin: boolean;
    canPublishNews: boolean;
    canPublishTrips: boolean;
    canEditGeography: boolean;
}