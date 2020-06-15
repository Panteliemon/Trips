import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterOperationSelectorComponent } from './filter-operation-selector.component';

describe('FilterOperationSelectorComponent', () => {
  let component: FilterOperationSelectorComponent;
  let fixture: ComponentFixture<FilterOperationSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterOperationSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterOperationSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
