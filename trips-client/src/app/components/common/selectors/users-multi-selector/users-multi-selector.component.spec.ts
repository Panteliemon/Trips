import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersMultiSelectorComponent } from './users-multi-selector.component';

describe('UsersMultiSelectorComponent', () => {
  let component: UsersMultiSelectorComponent;
  let fixture: ComponentFixture<UsersMultiSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersMultiSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersMultiSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
