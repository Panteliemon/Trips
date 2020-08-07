import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { Map, View, Feature, Overlay } from "ol";
import { Style, Icon } from 'ol/style';
import { OSM } from 'ol/source';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import { Extent } from 'ol/extent';

import { DEFAULT_LONGITUDE, DEFAULT_LATITUDE } from '../../common/maps';
import { PlaceKind } from 'src/app/models/place';
import { PlacesService } from 'src/app/services/places.service';
import { MessageService, MessageButtons, MessageIcon } from 'src/app/services/message.service';
import { PlaceOnMap } from 'src/app/models/place-on-map';
import { getPictureUrl } from 'src/app/stringUtils';

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
  selector: 'app-places-map',
  templateUrl: './places-map.component.html',
  styleUrls: ['./places-map.component.less']
})
export class PlacesMapComponent implements OnInit, AfterViewInit {
  @ViewChild("mapDiv")
  mapDiv: ElementRef;
  @ViewChild("popupDiv")
  popupDiv: ElementRef;

  isLoading: boolean;

  private _placeKindFilter: PlaceKind[] = [];
  get placeKindFilter(): PlaceKind[] {
    return this._placeKindFilter;
  }
  set placeKindFilter(value: PlaceKind[]) {
    this._placeKindFilter = value;
    this.putPlacesOnMap();
  }

  selectedPlace: PlaceOnMap = null;
  selectedPlaceName: string = "";
  selectedPlacePicSrc: string = null;

  private _map: Map;
  private _markersSource: VectorSource;
  private _popupOverlay: Overlay;

  private _places: PlaceOnMap[];

  constructor(private placesService: PlacesService, private messageService: MessageService) { }
  
  ngOnInit(): void {
    this.isLoading = true;
    this.placesService.getPlacesOnMap().subscribe(places => {
      this._places = places;
      this.isLoading = false;
      this.putPlacesOnMap();
      this.autoFit();
    }, error => {
      this.messageService.showMessage(this.placesService.getServerErrorText(error), MessageButtons.ok, MessageIcon.error);
      // keep "loading"
    });
  }

  ngAfterViewInit(): void {
    this._markersSource = new VectorSource();

    this._popupOverlay = new Overlay({
      element: this.popupDiv?.nativeElement
    });

    this._map = new Map({
      target: this.mapDiv?.nativeElement,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({
          source: this._markersSource,
          style: (feat: Feature): Style => {
            let place: PlaceOnMap = feat.get("place");
            if (place) {
              switch (place.kind) {
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
      overlays: [this._popupOverlay],
      view: new View({
        center: fromLonLat([DEFAULT_LONGITUDE, DEFAULT_LATITUDE]),
        zoom: 10
      })
    });

    this._map.on("click", event => {
      if (this._map.hasFeatureAtPixel(event.pixel) === true) {
        let features = this._map.getFeaturesAtPixel(event.pixel);
        if (features && (features.length > 0)) { // TROO!
          this.setSelectedPlace(features[0].get("place"));
          if (this.selectedPlace) {
            this._popupOverlay.setPosition(fromLonLat([this.selectedPlace.longitude, this.selectedPlace.latitude]));
          } else {
            this._popupOverlay.setPosition(undefined);
          }
        }  
      } else {
        this._popupOverlay.setPosition(undefined);
      }
    });

    this._map.on("pointermove", event => {
      if (!event.dragging) {
        if (this._map.hasFeatureAtPixel(event.pixel)) {
          this._map.getTargetElement().style.cursor = "pointer";
        } else {
          this._map.getTargetElement().style.cursor = "";
        }
      }
    })

    this.putPlacesOnMap();
    this.autoFit();
  }

  autoFit() {
    if (this._map && this._places) {
      let allFeatures = this._markersSource.getFeatures();
      if (allFeatures.length >= 2) {
        this._map.getView().fit(this.scaleExtent(this._markersSource.getExtent(), 1.1));
      } else if (allFeatures.length == 1) {
        let place: PlaceOnMap = allFeatures[0].get("place");
        if (place) {
          this._map.getView().setCenter(fromLonLat([place.longitude, place.latitude]));
        }
      }
    }
  }

  private setSelectedPlace(value: PlaceOnMap) {
    this.selectedPlace = value;

    // Update name
    this.selectedPlaceName = this.placesService.getDisplayablePlaceName(this.selectedPlace?.name);

    // Update pic src
    if (this.selectedPlace?.titlePictureSmallSizeId) {
      this.selectedPlacePicSrc = getPictureUrl(this.selectedPlace.titlePictureSmallSizeId, this.selectedPlace.titlePictureFormat);
    } else {
      this.selectedPlacePicSrc = "/assets/no-pic-place.png";
    }
  }

  private putPlacesOnMap() {
    if (this._places && this._map) {
      this._markersSource.clear();
      let featuresToAdd: Feature[] = [];

      for (let i=0; i<this._places.length; i++) {
        let place = this._places[i];
        if (this.passesFilter(place)) {
          let feat = new Feature({
            geometry: new Point(fromLonLat([place.longitude, place.latitude])),
            "place": place
          });

          featuresToAdd.push(feat);
        }
      }

      this._markersSource.addFeatures(featuresToAdd);
    }
  }

  private passesFilter(place: PlaceOnMap): boolean {
    if (this._placeKindFilter) {
      if (this.placeKindFilter.length == 0) {
        return true;
      } else {
        if (!place.kind) {
          return (this._placeKindFilter.indexOf(0) >= 0) || (this._placeKindFilter.indexOf(null) >= 0);
        } else {
          return this._placeKindFilter.indexOf(place.kind) >= 0;
        }
      }
    } else {
      return true;
    }
  }

  private scaleExtent(e: Extent, scalingFactor: number): Extent {
    // Regardless of what is X and what is Y there
    let size1 = e[2] - e[0];
    let size2 = e[3] - e[1];
    let center1 = (e[0] + e[2])/2;
    let center2 = (e[1] + e[3])/2;
    size1 *= scalingFactor;
    size2 *= scalingFactor;
    return [center1 - size1 / 2, center2 - size2 / 2, center1 + size1 / 2, center2 + size2 / 2]
  }
}
