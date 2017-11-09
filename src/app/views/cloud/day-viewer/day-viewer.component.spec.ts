import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayViewerComponent } from './day-viewer.component';

describe('DayViewerComponent', () => {
  let component: DayViewerComponent;
  let fixture: ComponentFixture<DayViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
