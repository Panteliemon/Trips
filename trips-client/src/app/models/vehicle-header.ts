import { UserHeader } from './user-header';
import { PicFormat } from './picture';
import { PlaceAccessibility } from './place';

export class VehicleHeader {
    id: number;
    owner: UserHeader;
    name: string;
    acceptableAccessibility: PlaceAccessibility;
    titlePictureSmallSizeId: string;
    titlePictureFormat: PicFormat;
}