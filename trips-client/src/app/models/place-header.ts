import { PlaceKind, PlaceAccessibility, PlacePopularity, PlaceCapacity } from './place';
import { PicFormat } from './picture';

export class PlaceHeader {
    id: number;
    urlId: string;
    kind: PlaceKind;
    name: string;
    discoveryDate: Date;
    titlePictureFormat: PicFormat;
    titlePictureSmallSizeId: string;
}