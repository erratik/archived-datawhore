import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DimensionListComponent } from './dimensions-list.component';

describe('DimensionListComponent', () => {
  let component: DimensionListComponent;
  let fixture: ComponentFixture<DimensionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DimensionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
