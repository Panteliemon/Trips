import { PlaceKind, PlaceAccessibility, PlacePopularity, PlaceCapacity } from './place';

export class PlaceHeader {
    id: number;
    kind: PlaceKind;
    name: string;
    discoveryDate: Date;
    accessibility: PlaceAccessibility;
    popularity: PlacePopularity;
    capacity: PlaceCapacity;
    titlePictureSmallSizeId: string;
}