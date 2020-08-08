import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacesStatsComponent } from './places-stats.component';

describe('PlacesStatsComponent', () => {
  let component: PlacesStatsComponent;
  let fixture: ComponentFixture<PlacesStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlacesStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlacesStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
