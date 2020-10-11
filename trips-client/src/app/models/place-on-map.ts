import { PlaceKind } from './place';
import { PicFormat } from './picture';

export class PlaceOnMap {
  id: number;
  urlId: string;
  kind: PlaceKind;
  name: string;
  latitude: number;
  longitude: number;
  titlePictureFormat: PicFormat;
  titlePictureSmallSizeId: string;
}