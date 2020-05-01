import { PlaceKind, PlaceAccessibility, PlacePopularity } from './place';

export class PlaceHeader {
    id: number;
    kind: PlaceKind;
    name: string;
    discoveryDate: Date;
    accessibility: PlaceAccessibility;
    popularity: PlacePopularity;
    titlePictureSmallSizeId: string;
}