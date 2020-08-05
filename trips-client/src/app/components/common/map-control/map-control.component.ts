import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Map, View, Feature, Overlay } from 'ol';
import { OSM } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { useGeographic, fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Icon from 'ol/style/Icon';
import Fill from 'ol/style/Fill';
import Polygon from 'ol/geom/Polygon';
import { Coordinates } from 'src/app/stringUtils';
import Stroke from 'ol/style/Stroke';
import { PlaceKind } from 'src/app/models/place';
import { Extent } from 'ol/extent';

function iconStyle(src: string): Style {
  return new Style({
    image: new Icon({
      src: src
    })
  });
}

const styleNA = iconStyle("/assets/mapicon-na.png");
const styleLake = iconStyle("/assets/mapicon-lake.png");
const styleDam = iconStyle("/assets/mapicon-dam.png");
const styleRiver = iconStyle("/assets/mapicon-river.png");
const styleTown = iconStyle("/assets/mapicon-town.png");
const styleRuins = iconStyle("/assets/mapicon-ruins.png");
const styleTouristAttraction = iconStyle("/assets/mapicon-touristattraction.png");
const styleAbandoned = iconStyle("/assets/mapicon-abandoned.png");


@Component({
  selector: 'app-map-control',
  templateUrl: './map-control.component.html',
  styleUrls: ['./map-control.component.less']
})
export class MapControlComponent implements OnInit, AfterViewInit {
  private _map: Map;
  private _markersSource: VectorSource;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this._markersSource = new VectorSource();

    let popup = document.getElementById("popup");

    let overlay = new Overlay({
      element: popup
    });

    this._map = new Map({
      target: "map",
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({
          source: this._markersSource,
          style: (feat: Feature): Style => {
            if (feat.get("placeKind") !== undefined) {
              switch (feat.get("placeKind")) {
                case PlaceKind.LAKE: return styleLake;
                case PlaceKind.DAM: return styleDam;
                case PlaceKind.RIVER: return styleRiver;
                case PlaceKind.TOWN: return styleTown;
                case PlaceKind.RUINS: return styleRuins;
                case PlaceKind.TOURISTATTRACTION: return styleTouristAttraction;
                case PlaceKind.ABANDONED: return styleAbandoned;
              }
            }

            return styleNA;
          }
        })
      ],
      overlays: [overlay],
      view: new View({
        center: fromLonLat([27.561896, 53.902235]),
        zoom: 11,
      })
    });

    this._map.on('singleclick', (event) => {
      if (this._map.hasFeatureAtPixel(event.pixel) === true) {
        let features = this._map.getFeaturesAtPixel(event.pixel);
        if (features && (features.length > 0)) { // TROO!
          //this._map.getPixelFromCoordinate
          let coordinate = this._map.getCoordinateFromPixel([event.pixel[0]+20, event.pixel[1]-12])
          
          //let coordinate = event.coordinate;
          overlay.setPosition(coordinate);
          popup.innerHTML = "place kind == " + features[0].get("placeKind");
        }  
      } else {
        overlay.setPosition(undefined);
      }
    });
  }

  flag: boolean;
  magic() {
    if (this.flag) {
      this._markersSource.clear();
    } else {
      this._markersSource.addFeature(new Feature({
        geometry: new Point(fromLonLat([27.5, 54])),
        placeKind: PlaceKind.LAKE
      }));
      this._markersSource.addFeature(new Feature({
        geometry: new Point(fromLonLat([27.371578, 53.907352])),
        placeKind: PlaceKind.RIVER
      }));

      // Auto fit:
      this._map.getView().fit(this.scaleExtent(this._markersSource.getExtent(), 1.1));
    }

    this.flag = !this.flag;
  }

  private scaleExtent(e: Extent, scalingFactor: number): Extent {
    // Regardless of what is X and what is Y
    let size1 = e[2] - e[0];
    let size2 = e[3] - e[1];
    let center1 = (e[0] + e[2])/2;
    let center2 = (e[1] + e[3])/2;
    size1 *= scalingFactor;
    size2 *= scalingFactor;
    return [center1 - size1 / 2, center2 - size2 / 2, center1 + size1 / 2, center2 + size2 / 2]
  }
}
