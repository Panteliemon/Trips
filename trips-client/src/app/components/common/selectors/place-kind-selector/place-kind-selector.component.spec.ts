import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceKindSelectorComponent } from './place-kind-selector.component';

describe('PlaceKindSelectorComponent', () => {
  let component: PlaceKindSelectorComponent;
  let fixture: ComponentFixture<PlaceKindSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceKindSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceKindSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
