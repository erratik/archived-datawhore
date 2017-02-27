import {Component, OnInit} from '@angular/core';
import {SpacesService} from '../../../services/spaces.service';
import {ActivatedRoute} from '@angular/router';
import {SpaceConfigComponent} from '../../../shared/component/space-config/space-config.component';
import {Space} from '../../../models/space.model';
import {Paths} from '../../../classes/paths.class';
import {DimensionSchema} from '../../../models/dimension-schema.model';
import {OauthSettingsService} from '../../../services/space/oauth-settings.service';
import {FileUploader} from 'ng2-file-upload';
import {ProfileService} from '../../../services/profile/profile.service';
import {Profile} from '../../../models/profile.model';

@Component({
    selector: 'datawhore-view-space',
    templateUrl: 'view-space.component.html',
    styleUrls: ['view-space.component.less']
})

export class SpaceViewComponent extends SpaceConfigComponent implements OnInit {

    public space: Space = null;
    public profile: Profile = null;
    public profileSchema: any = null;
    public uploader: FileUploader;
    // @Output() onNewDims

    constructor(spacesService: SpacesService,
                oauthService: OauthSettingsService,
                profileService: ProfileService,
                activatedRoute: ActivatedRoute) {
        super(spacesService, oauthService, profileService, activatedRoute);
    }

    ngOnInit() {

        const spaceConfig$ = this.retrieveSpace$
            .switchMap(() => this.getProfile())
            .mergeMap(() => this.getRawProfile())
            .do((profileSchema) => {
                this.profileSchema = new DimensionSchema(profileSchema['type'], profileSchema['content'], profileSchema['modified']);
            });

        spaceConfig$.subscribe(() => {
            this.profile.enablePropertyBucket(this.profileSchema.propertyBucket);

            this.uploader = new FileUploader({url: `${Paths.DATAWHORE_API_URL}/upload/${this.space.name}/space/icon`});
            this.uploader.onCompleteItem = (item, response, status) => {
                if (status === 200) {
                    const res = JSON.parse(response);
                    this.space.icon = res.icon;
                    this.space.modified = res.modified;
                }
            };
        });

    }

    private getProfile(): any {

        return this.profileService.getProfile(this.space).do((profile) => {
            this.profile = new Profile(profile.space, profile.profile, profile.modified);
        });

    }

    private getRawProfile(): any {

        return this.profileService.fetchRaw(this.space).do((profileSchema) => {
            this.profileSchema = new DimensionSchema(profileSchema['type'], profileSchema['content'], profileSchema.modified);
        });

    }

    protected resetRawProfile(): any {

        // strat with oauth2 values, for most /api/space/endpoint usages
        const data = Object.assign(this.oauth2);
        data['apiEndpointUrl'] = Paths.PROFILE_FETCH_URL[this.space.name];
        data['action'] = 'schemas.write';
        data['type'] = 'profile';
        data['space'] = this.space.name;

        const profileSchema$ = this.spacesService.spaceEndpoint(this.space, data).do((profileSchema) => {
            this.profileSchema = new DimensionSchema(profileSchema['type'], profileSchema['content'], profileSchema.modified);
        });

        profileSchema$.subscribe(() => {
            console.log(this.profileSchema.propertyBucket);
        });

    }

    public toggleEditSpace(): void {
        this.space.inEditMode = !this.space.inEditMode;
    }

}
