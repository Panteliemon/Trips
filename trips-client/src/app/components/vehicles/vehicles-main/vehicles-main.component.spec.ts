import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclesMainComponent } from './vehicles-main.component';

describe('VehiclesMainComponent', () => {
  let component: VehiclesMainComponent;
  let fixture: ComponentFixture<VehiclesMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VehiclesMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VehiclesMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
