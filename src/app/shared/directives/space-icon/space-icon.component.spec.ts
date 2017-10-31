import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceIconComponent } from './space-icon.component';

describe('SpaceIconComponent', () => {
  let component: SpaceIconComponent;
  let fixture: ComponentFixture<SpaceIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpaceIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpaceIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
