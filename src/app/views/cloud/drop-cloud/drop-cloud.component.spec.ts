import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropCloudComponent } from './drop-cloud.component';

describe('DropCloudComponent', () => {
  let component: DropCloudComponent;
  let fixture: ComponentFixture<DropCloudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropCloudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropCloudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
