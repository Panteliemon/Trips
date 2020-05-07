import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacesOrderingSelectorComponent } from './places-ordering-selector.component';

describe('PlacesOrderingSelectorComponent', () => {
  let component: PlacesOrderingSelectorComponent;
  let fixture: ComponentFixture<PlacesOrderingSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlacesOrderingSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlacesOrderingSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
