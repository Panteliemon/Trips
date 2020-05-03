import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceAccessibilitySelectorComponent } from './place-accessibility-selector.component';

describe('PlaceAccessibilitySelectorComponent', () => {
  let component: PlaceAccessibilitySelectorComponent;
  let fixture: ComponentFixture<PlaceAccessibilitySelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceAccessibilitySelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceAccessibilitySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
