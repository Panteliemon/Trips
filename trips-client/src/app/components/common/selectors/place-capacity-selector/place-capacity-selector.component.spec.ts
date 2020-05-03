import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceCapacitySelectorComponent } from './place-capacity-selector.component';

describe('PlaceCapacitySelectorComponent', () => {
  let component: PlaceCapacitySelectorComponent;
  let fixture: ComponentFixture<PlaceCapacitySelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceCapacitySelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceCapacitySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
