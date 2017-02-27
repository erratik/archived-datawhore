import { TestBed, inject } from '@angular/core/testing';
import { DimensionsService } from './space-item.service';

describe('DimensionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DimensionsService]
    });
  });

  it('should ...', inject([DimensionsService], (service: DimensionsService) => {
    expect(service).toBeTruthy();
  }));
});
