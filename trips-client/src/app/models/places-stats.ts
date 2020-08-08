import { PlaceHeader } from './place-header';

export class PlacesMetric {
    places: PlaceHeader[];
    metric: number;
}

export class PlacesStats {
    mostVisited: PlacesMetric[];
    mostNightStay: PlacesMetric[];
}