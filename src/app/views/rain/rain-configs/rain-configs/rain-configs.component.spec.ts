import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RainConfigsComponent } from './rain-configs.component';

describe('RainConfigsComponent', () => {
  let component: RainConfigsComponent;
  let fixture: ComponentFixture<RainConfigsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RainConfigsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RainConfigsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
