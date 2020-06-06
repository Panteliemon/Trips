import { PlaceHeader } from './place-header';
import { Gallery } from './gallery';

export class Visit {
    id: number;
    place: PlaceHeader;
    gallery: Gallery;
    withKebab: boolean;
    withNightStay: boolean;
}