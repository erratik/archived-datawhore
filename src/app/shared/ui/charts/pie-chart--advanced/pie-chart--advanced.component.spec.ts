import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PieChartAdvancedComponent } from './pie-chart--advanced.component';

describe('PieChartAdvancedComponent', () => {
  let component: PieChartAdvancedComponent;
  let fixture: ComponentFixture<PieChartAdvancedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PieChartAdvancedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PieChartAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
