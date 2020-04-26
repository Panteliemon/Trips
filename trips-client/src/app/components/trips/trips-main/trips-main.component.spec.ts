import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripsMainComponent } from './trips-main.component';

describe('TripsMainComponent', () => {
  let component: TripsMainComponent;
  let fixture: ComponentFixture<TripsMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripsMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
