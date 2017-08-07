import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageFigureComponent } from './image-figure.component';

describe('ImageFigureComponent', () => {
  let component: ImageFigureComponent;
  let fixture: ComponentFixture<ImageFigureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageFigureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageFigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
