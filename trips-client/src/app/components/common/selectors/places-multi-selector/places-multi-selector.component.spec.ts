import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacesMultiSelectorComponent } from './places-multi-selector.component';

describe('PlacesMultiSelectorComponent', () => {
  let component: PlacesMultiSelectorComponent;
  let fixture: ComponentFixture<PlacesMultiSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlacesMultiSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlacesMultiSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
