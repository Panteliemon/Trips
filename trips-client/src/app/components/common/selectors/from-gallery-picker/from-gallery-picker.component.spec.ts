import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FromGalleryPickerComponent } from './from-gallery-picker.component';

describe('FromGalleryPickerComponent', () => {
  let component: FromGalleryPickerComponent;
  let fixture: ComponentFixture<FromGalleryPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FromGalleryPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FromGalleryPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
