import { Picture } from './picture';
import { Gallery } from './gallery';
import { UserHeader } from './user-header';
import { Visit } from './visit';
import { VehicleHeader } from './vehicle-header';

export class Trip {
    id: number;
    title: string;
    description: string;
    date: Date;
    titlePicture: Picture;
    gallery: Gallery;
    addedBy: UserHeader;
    addedDate: Date;
    changedBy: UserHeader;
    changedDate: Date;
    participants: UserHeader[];
    vehicles: VehicleHeader[];
    visits: Visit[];
}