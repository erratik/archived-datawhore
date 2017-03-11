import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RainFormComponent } from './rain-form.component';

describe('RainFormComponent', () => {
  let component: RainFormComponent;
  let fixture: ComponentFixture<RainFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RainFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RainFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
