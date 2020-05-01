import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { Gallery } from 'src/app/models/gallery';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit, OnChanges {
  @Input()
  gallery: Gallery;

  @Input()
  isEditable: boolean;

  constructor() { }
 
  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["gallery"]) {
      console.info("gallery changed");
    }
  }

}
