import { TestBed, inject } from '@angular/core/testing';
import { OauthSettingsService } from './oauth-settings.service';

describe('OauthSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OauthSettingsService]
    });
  });

  it('should ...', inject([OauthSettingsService], (service: OauthSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
