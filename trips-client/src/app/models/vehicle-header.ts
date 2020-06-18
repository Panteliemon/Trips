import { UserHeader } from './user-header';
import { PicFormat } from './picture';

export class VehicleHeader {
    id: number;
    owner: UserHeader;
    name: string;
    licenseNumber: string;
    titlePictureSmallSizeId: string;
    titlePictureFormat: PicFormat;
}