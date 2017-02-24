import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceConfigComponent } from './space-config.component';

describe('SpaceConfigComponent', () => {
  let component: SpaceConfigComponent;
  let fixture: ComponentFixture<SpaceConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpaceConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpaceConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
