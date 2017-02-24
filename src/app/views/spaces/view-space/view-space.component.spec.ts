import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceViewComponent } from './view-space.component';

describe('SpaceViewComponent', () => {
  let component: SpaceViewComponent;
  let fixture: ComponentFixture<SpaceViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpaceViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpaceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
