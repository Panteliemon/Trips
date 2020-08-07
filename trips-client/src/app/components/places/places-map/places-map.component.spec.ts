import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacesMapComponent } from './places-map.component';

describe('PlacesMapComponent', () => {
  let component: PlacesMapComponent;
  let fixture: ComponentFixture<PlacesMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlacesMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlacesMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
