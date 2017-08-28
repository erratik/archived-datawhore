import * as console from 'console';
import { window } from 'rxjs/operator/window';
import { Space } from '../../../models/space.model';
import { SpacesService } from '../../../services/spaces.service';
import { OauthSettingsService } from '../../../services/space/oauth-settings.service';
import { SpaceItemService } from '../../../shared/services/space-item/space-item.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { ActivatedRoute } from '@angular/router';
import { Profile } from '../../../models/profile.model';
import { SpaceConfigComponent } from '../../../shared/component/space-config/space-config.component';
import { RainService } from '../../../services/rain/rain.service';
import { DimensionSchema } from '../../../models/dimension-schema.model';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'datawhore-profile-config',
  templateUrl: './profile-config.component.html',
  styleUrls: ['./profile-config.component.less']
})
export class ProfileConfigComponent  extends SpaceConfigComponent implements OnInit {

  public space: Space;
  public profile: Profile;
  public profileSchema: DimensionSchema;
  protected isFetchingSchema = false;
  protected activeTab = 'rain';
  @Output() public onUpdateSpace: EventEmitter<any> = new EventEmitter<any>();

  constructor(spacesService: SpacesService,
    oauthService: OauthSettingsService,
    spaceItemService: SpaceItemService,
    profileService: ProfileService,
    rainService: RainService,
    activatedRoute: ActivatedRoute) {
  super(spacesService, oauthService, spaceItemService, profileService, rainService, activatedRoute);
  }


  ngOnInit() {

    const spaceConfig$ = this.retrieveSpace$
        .switchMap(() => this.getProfile())
        .mergeMap(profileRes => this.getRawProfile(profileRes))
        .switchMap(() => this.activatedRoute.params)
        .do((params) => {
            if (!this.space.oauth.connected) {
                this.activeTab = 'space';
            }
            // console.log(params);
            this.activeTab = params['tab'];
        });


    spaceConfig$.subscribe(() => {

        // document.title = `${this.space.name} | view space`;

    });
  }


  private getProfile(): any {
    return this.profileService.getProfile(this.space.name).do((profileRes) => {
        this.profile = new Profile(profileRes.space, profileRes.profile, profileRes.modified);
        return profileRes;
    });
  }

  private getRawProfile(profileRes): any {
      return this.profileService.fetchSchema(this.space.name).do((profileSchema) => {
          this.profileSchema = new DimensionSchema(profileSchema['type'], profileSchema['content'], profileSchema.modified);
          this.profileSchema.propertyBucket = this.profileSchema.assignValues(profileRes.profile);
      });
  }

  public updateSpace(space: Space = this.space): void {
      this.onUpdateSpace.emit(space);
  }

}
