import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclePickerComponent } from './vehicle-picker.component';

describe('VehiclePickerComponent', () => {
  let component: VehiclePickerComponent;
  let fixture: ComponentFixture<VehiclePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VehiclePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VehiclePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
