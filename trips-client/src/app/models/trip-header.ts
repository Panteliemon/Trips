import { PicFormat } from './picture';
import { UserHeader } from './user-header';

export class TripHeader {
    id: number;
    title: string;
    date: Date;
    titlePictureSmallSizeId: string;
    titlePictureFormat: PicFormat;
    participants: UserHeader[];
}