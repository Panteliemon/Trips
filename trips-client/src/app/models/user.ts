export class User {
    id: number;
    name: string;
    registeredDate: Date;
    lastChangedName: Date;
    profilePicture: string;
    isAdmin: boolean;
    canPublishNews: boolean;
    canPublishTrips: boolean;
    canEditGeography: boolean;
}