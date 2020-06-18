import { UserHeader } from './user-header';
import { PlaceAccessibility } from './place';
import { Gallery } from './gallery';
import { Picture } from './picture';

export class Vehicle {
    id: number;
    owner: UserHeader;
    name: string;
    officialName: string;
    description: string;
    licenseNumber: string;
    yearOfManufacture: number;
    acceptableAccessibility: PlaceAccessibility;
    gallery: Gallery;
    titlePicture: Picture;
    addedBy: UserHeader;
    addedDate: Date;
    changedBy: UserHeader;
    changedDate: Date;
}