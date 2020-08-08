import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { Map, View, Feature } from 'ol';
import { OSM } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Circle, Fill, Stroke} from 'ol/style';
import { Point } from 'ol/geom';
import * as olInteraction from 'ol/interaction';
import { DEFAULT_LONGITUDE, DEFAULT_LATITUDE } from '../maps';
import { Coordinates, parseCoordinates, createGoogleRefFromCoordinates } from 'src/app/stringUtils';
import { isMobileBrowser } from 'src/app/platformUtils';

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
  valueChange = new EventEmitter<Coordinates>();

  private _map: Map;
  private _markerSource: VectorSource;
  private _reactsOnScroll: boolean = false;
  private _mouseWheelInteraction: olInteraction.Interaction;
  private _dragPanInteraction: olInteraction.Interaction;
  private _isMobileBrowser: boolean;
 
  @ViewChild("map")
  mapElement: ElementRef;

  coordinateText: string;
  linkText: string;
  linkUrl: string;

  // To detect that we catch changes from model that we initiated by ourselves earlier.
  private _raisedLatitude: number = undefined;
  private _raisedLongitude: number = undefined;

  constructor() { }

  public setReactsOnScroll(value: boolean) {
    if ((value != this._reactsOnScroll) && (this._map)) {
      if (value) {
        this._map.addInteraction(this._mouseWheelInteraction);
        if (this._isMobileBrowser) {
          this._map.addInteraction(this._dragPanInteraction);
        }
      } else {
        this._map.removeInteraction(this._mouseWheelInteraction);
        if (this._isMobileBrowser) {
          this._map.removeInteraction(this._dragPanInteraction);
        }
      }

      this._reactsOnScroll = value;
    }
  }

  public autoCenter() {
    // Only if both null or both not null.
    if (this.latitude && this.longitude) {
      this._map.getView().setCenter(fromLonLat([this.longitude, this.latitude]));
      this._map.getView().setZoom(14);
    } else if ((!this.latitude) && (!this.longitude)) {
      this._map.getView().setCenter(fromLonLat([DEFAULT_LONGITUDE, DEFAULT_LATITUDE]));
      this._map.getView().setZoom(11);
    }
  }

  ngOnInit(): void {
    this.showCoordinateText();
    this.tuneLink();
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
      }),
      interactions: olInteraction.defaults({
        pinchRotate: false,
        altShiftDragRotate: false
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

      if (this._isMobileBrowser) { // On desktop this event is not enough, see mousedown
        this.setReactsOnScroll(true);
      }
    });

    // Map is not scrollable until clicked.
    this._reactsOnScroll = true; // initialize without setter function
    this._isMobileBrowser = isMobileBrowser();
    this._mouseWheelInteraction = this._map.getInteractions().getArray().find(i => i instanceof olInteraction.MouseWheelZoom);
    this._dragPanInteraction = this._map.getInteractions().getArray().find(i => i instanceof olInteraction.DragPan);
    this.setReactsOnScroll(false); // now can use setter function

    if (!this._isMobileBrowser) { // On mobile only wake up on click, because mousedown can be scroll
      this.mapElement?.nativeElement.addEventListener("mousedown", evt => {
        this.setReactsOnScroll(true);
      });
    }

    this.showCurrentValueMarker();
    this.autoCenter();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this._map) { // initialized
      if (changes["latitude"]) {
        // If the change was initiated by ourselves, then ignore.
        if ((this._raisedLatitude === undefined) || (this._raisedLatitude != this.latitude)) { // no raised event || change differs from what was raised
          this.lngLatChanged();
        }

        this._raisedLatitude = undefined; // reset every time
      }

      if (changes["longitude"]) {
        // If the change was initiated by ourselves, then ignore.
        if ((this._raisedLongitude === undefined) || (this._raisedLongitude != this.longitude)) {
          this.lngLatChanged();
        }

        this._raisedLongitude = undefined; // reset every time
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

  private raiseChange() {
    this._raisedLatitude = this.latitude;
    this._raisedLongitude = this.longitude;
    this.valueChange.emit(new Coordinates(this.latitude, this.longitude));  
  }
}
