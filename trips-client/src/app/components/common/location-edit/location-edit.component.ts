import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { Map, View, Feature } from 'ol';
import { OSM } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Circle, Fill, Stroke} from 'ol/style';
import { Point } from 'ol/geom';
import { DEFAULT_LONGITUDE, DEFAULT_LATITUDE } from '../maps';
import { Coordinates, parseCoordinates, createGoogleRefFromCoordinates } from 'src/app/stringUtils';

@Component({
  selector: 'app-location-edit',
  templateUrl: './location-edit.component.html',
  styleUrls: ['./location-edit.component.less']
})
export class LocationEditComponent implements OnInit, AfterViewInit, OnChanges {
  @Input()
  latitude: number;
  @Input()
  longitude: number;
  @Input()
  isEditable: boolean = true;

  @Output()
  change = new EventEmitter<Coordinates>();

  private _map: Map;
  private _markerSource: VectorSource;
 
  @ViewChild("map")
  mapElement: ElementRef;

  coordinateText: string;
  linkText: string;
  linkUrl: string;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this._markerSource = new VectorSource();

    this._map = new Map({
      target: this.mapElement?.nativeElement,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({
          source: this._markerSource,
          style: new Style({
            image: new Circle({
              radius: 9,
              fill: new Fill({color: [255, 0, 0]}),
              stroke: new Stroke({
                color: "white",
                width: 3
              })
            })
          })
        })
      ],
      view: new View({
        center: fromLonLat([DEFAULT_LONGITUDE, DEFAULT_LATITUDE]),
        zoom: 11,
        minZoom: 5
      })
    });

    this._map.on("click", (event) => {
      if (this.isEditable) {
        let coordinate = toLonLat(this._map.getCoordinateFromPixel(event.pixel));
        this.latitude = coordinate[1];
        this.longitude = coordinate[0];
        this.showCurrentValueMarker();
        this.showCoordinateText();
        this.tuneLink();
        this.raiseChange();
      }
    });

    this.lngLatChanged();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this._map) { // initialized
      if (changes["latitude"]) {
        this.lngLatChanged();
      }

      if (changes["longitude"]) {
        this.lngLatChanged();
      }
    }
  }

  coordinateTextChange(newValue: string) {
    if (newValue != this.coordinateText) {
      this.coordinateText = newValue;
      let coordinates = parseCoordinates(newValue);
      if (coordinates) {
        this.latitude = coordinates.latitude;
        this.longitude = coordinates.longitude;
        this.autoCenter();
      } else {
        this.latitude = null;
        this.longitude = null;
      }

      this.showCurrentValueMarker();
      this.tuneLink();
      this.raiseChange();
    }
  }

  private lngLatChanged() {
    this.showCurrentValueMarker();
    this.autoCenter();
    this.showCoordinateText();
    this.tuneLink();
  }

  private showCurrentValueMarker() {
    // Both null or both not null. Only then.
    if (this.latitude && this.longitude) {
      this._markerSource.clear();
      this._markerSource.addFeature(new Feature({
        geometry: new Point(fromLonLat([this.longitude, this.latitude]))
      }));
    } else if ((!this.latitude) && (!this.longitude)) {
      this._markerSource.clear();
    }
  }

  private showCoordinateText() {
    // Only if both null or both not null.
    if (this.latitude && this.longitude) {
      this.coordinateText = this.latitude.toFixed(6) + ", " + this.longitude.toFixed(6);
    } else if ((!this.latitude) && (!this.longitude)) {
      this.coordinateText = "";
    }
  }

  private tuneLink() {
    // Only if both null or both not null.
    if (this.latitude && this.longitude) {
      // Same rule as for text based on coordinates
      this.linkText = this.latitude.toFixed(6) + ", " + this.longitude.toFixed(6);
      this.linkUrl = createGoogleRefFromCoordinates(new Coordinates(this.latitude, this.longitude))
    } else if ((!this.latitude) && (!this.longitude)) {
      this.linkText = "";
      this.linkUrl = "";
    }
  }

  private autoCenter() {
    // Only if both null or both not null.
    if (this.latitude && this.longitude) {
      this._map.getView().setCenter(fromLonLat([this.longitude, this.latitude]));
      this._map.getView().setZoom(14);
    } else if ((!this.latitude) && (!this.longitude)) {
      this._map.getView().setCenter(fromLonLat([DEFAULT_LONGITUDE, DEFAULT_LATITUDE]));
      this._map.getView().setZoom(11);
    }
  }

  private raiseChange() {
    this.change.emit(new Coordinates(this.latitude, this.longitude));
  }
}
