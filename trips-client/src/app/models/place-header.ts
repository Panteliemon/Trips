import { PlaceKind, PlaceAccessibility, PlacePopularity, PlaceCapacity } from './place';
import { PicFormat } from './picture';

export class PlaceHeader {
    id: number;
    kind: PlaceKind;
    name: string;
    discoveryDate: Date;
    accessibility: PlaceAccessibility;
    popularity: PlacePopularity;
    capacity: PlaceCapacity;
    titlePictureFormat: PicFormat;
    titlePictureSmallSizeId: string;
}