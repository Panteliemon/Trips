import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectorEngineComponent } from './multi-selector-engine.component';

describe('MultiSelectorEngineComponent', () => {
  let component: MultiSelectorEngineComponent;
  let fixture: ComponentFixture<MultiSelectorEngineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiSelectorEngineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSelectorEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
