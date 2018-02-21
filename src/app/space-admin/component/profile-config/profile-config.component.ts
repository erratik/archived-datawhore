import * as console from 'console';
import { window } from 'rxjs/operator/window';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { Space } from '../../../shared/models/space.model';
import { Profile } from '../../../shared/models/profile.model';
import { SpacesService } from '../../../shared/services/spaces.service';
import { SpaceItemService } from '../../../shared/services/space-item.service';
import { ProfileService } from '../../../shared/services/profile.service';
import { RainService } from '../../../shared/services/rain.service';
import { DimensionSchema } from '../../../shared/models/dimension-schema.model';

import { OauthSettingsService } from '../../services/oauth-settings.service';
import { SpaceConfigComponent } from '../space-config/space-config.component';

@Component({
    selector: 'datawhore-profile-config',
    templateUrl: './profile-config.component.html',
    styleUrls: ['./profile-config.component.less']
})
export class ProfileConfigComponent extends SpaceConfigComponent implements OnInit {

    public space: Space;
    public profile: Profile;
    public profileSchema: DimensionSchema;
    protected isFetchingSchema = false;
    protected activeTab = 'rain';
    @Output() public onUpdateSpace: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        router: Router,
        spacesService: SpacesService,
        spaceItemService: SpaceItemService,
        activatedRoute: ActivatedRoute,
        rainService: RainService,
        profileService: ProfileService,
        oauthService: OauthSettingsService) {
        super(router, spacesService, spaceItemService, activatedRoute, rainService, profileService, oauthService);
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
