import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacesCategorySelectionComponent } from './places-category-selection.component';

describe('PlacesCategorySelectionComponent', () => {
  let component: PlacesCategorySelectionComponent;
  let fixture: ComponentFixture<PlacesCategorySelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlacesCategorySelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlacesCategorySelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
