/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SpacesService } from './spaces.service';

describe('SpacesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpacesService]
    });
  });

  it('should ...', inject([SpacesService], (service: SpacesService) => {
    expect(service).toBeTruthy();
  }));
});
