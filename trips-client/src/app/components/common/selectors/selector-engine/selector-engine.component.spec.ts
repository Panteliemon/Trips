import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorEngineComponent } from './selector-engine.component';

describe('SelectorEngineComponent', () => {
  let component: SelectorEngineComponent;
  let fixture: ComponentFixture<SelectorEngineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorEngineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectorEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
