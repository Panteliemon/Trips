import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceKindMultiSelectorComponent } from './place-kind-multi-selector.component';

describe('PlaceKindMultiSelectorComponent', () => {
  let component: PlaceKindMultiSelectorComponent;
  let fixture: ComponentFixture<PlaceKindMultiSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceKindMultiSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceKindMultiSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
