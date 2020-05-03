import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacePopularitySelectorComponent } from './place-popularity-selector.component';

describe('PlacePopularitySelectorComponent', () => {
  let component: PlacePopularitySelectorComponent;
  let fixture: ComponentFixture<PlacePopularitySelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlacePopularitySelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlacePopularitySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
