import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropAtomicComponent } from './drop-atomic.component';

describe('DropAtomicComponent', () => {
  let component: DropAtomicComponent;
  let fixture: ComponentFixture<DropAtomicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropAtomicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropAtomicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
