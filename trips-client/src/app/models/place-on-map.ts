import { PlaceKind } from './place';
import { PicFormat } from './picture';

export class PlaceOnMap {
  id: number;
  kind: PlaceKind;
  name: string;
  latitude: number;
  longitude: number;
  titlePictureFormat: PicFormat;
  titlePictureSmallSizeId: string;
}