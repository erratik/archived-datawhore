import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceItemComponent } from './space-item.component';

describe('SpaceItemComponent', () => {
  let component: SpaceItemComponent;
  let fixture: ComponentFixture<SpaceItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpaceItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpaceItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
