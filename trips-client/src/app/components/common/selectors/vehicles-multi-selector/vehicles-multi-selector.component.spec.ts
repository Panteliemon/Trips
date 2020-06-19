import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclesMultiSelectorComponent } from './vehicles-multi-selector.component';

describe('VehiclesMultiSelectorComponent', () => {
  let component: VehiclesMultiSelectorComponent;
  let fixture: ComponentFixture<VehiclesMultiSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VehiclesMultiSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VehiclesMultiSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
