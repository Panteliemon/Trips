import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionsMainComponent } from './regions-main.component';

describe('RegionsMainComponent', () => {
  let component: RegionsMainComponent;
  let fixture: ComponentFixture<RegionsMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegionsMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
