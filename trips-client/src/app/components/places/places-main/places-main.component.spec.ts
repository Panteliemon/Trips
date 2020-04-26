import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacesMainComponent } from './places-main.component';

describe('PlacesMainComponent', () => {
  let component: PlacesMainComponent;
  let fixture: ComponentFixture<PlacesMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlacesMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlacesMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
