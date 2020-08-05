import { UserHeader } from './user-header';
import { Gallery } from './gallery';
import { Picture } from './picture';

export enum PlaceKind {
    LAKE = 1,
    DAM = 2,
    RIVER = 3,
    TOWN = 4,
    RUINS = 5,
    TOURISTATTRACTION = 6,
    ABANDONED = 7
}

export enum PlaceAccessibility {
    ASPHALTGRAVEL = 1,
    DIRTROADFLAT = 2,
    DEEPTRACKSPUDDLES = 3,
    TRACTORONLY = 4,
    NOROAD = 5
}

export enum PlacePopularity {
    ALWAYSFREE = 1,
    SOMETIMESOCCUPIED = 2,
    MOSTPROBABLYOCCUPIED = 3,
    CROWDED = 4
}

export enum PlaceCapacity {
    ZERO = 0,
    SINGLE = 1,
    SEVERAL = 2,
    NUMEROUS = 3
}

export class Place {
    id: number;
    kind: PlaceKind;
    name: string;
    description: string;
    location: string;
    latitude: number;
    longitude: number;
    addedBy: UserHeader;
    addedDate: Date;
    changedBy: UserHeader;
    changedDate: Date;

    discoveryDate: Date;
    accessibility: PlaceAccessibility;
    nearestAccessibility: PlaceAccessibility;
    popularity: PlacePopularity;
    capacity: PlaceCapacity;
    isXBApproved: boolean;

    titlePicture: Picture;
    gallery: Gallery;
}