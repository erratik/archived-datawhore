import { TestBed, inject } from '@angular/core/testing';
import { SpaceItemService } from './space-item.service';

describe('SpaceItemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpaceItemService]
    });
  });

  it('should ...', inject([SpaceItemService], (service: SpaceItemService) => {
    expect(service).toBeTruthy();
  }));
});
