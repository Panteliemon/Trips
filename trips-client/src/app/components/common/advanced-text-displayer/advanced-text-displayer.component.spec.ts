import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedTextDisplayerComponent } from './advanced-text-displayer.component';

describe('AdvancedTextDisplayerComponent', () => {
  let component: AdvancedTextDisplayerComponent;
  let fixture: ComponentFixture<AdvancedTextDisplayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvancedTextDisplayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedTextDisplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
