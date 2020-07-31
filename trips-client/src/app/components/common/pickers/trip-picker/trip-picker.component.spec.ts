import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripPickerComponent } from './trip-picker.component';

describe('TripPickerComponent', () => {
  let component: TripPickerComponent;
  let fixture: ComponentFixture<TripPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
