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
import {SchemaValuePipe} from '../../../shared/pipes/schema-value.pipe';

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
    protected isFetchingSchema = false;
    // @Output() onNewDims

    constructor(spacesService: SpacesService,
                oauthService: OauthSettingsService,
                profileService: ProfileService,
                activatedRoute: ActivatedRoute,
                private schemaValuePipe: SchemaValuePipe) {
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
            this.profile.createPropertyBucket(this.profileSchema.propertyBucket);

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

        return this.profileService.getProfile(this.space.name).do((profile) => {
            this.profile = new Profile(profile.space, profile.profile, profile.modified);
        });

    }

    private getRawProfile(): any {

        return this.profileService.fetchRaw(this.space.name).do((profileSchema) => {
            this.profileSchema = new DimensionSchema(profileSchema['type'], profileSchema['content'], profileSchema.modified);
        });

    }

    protected resetRawProfile(): any {

        this.isFetchingSchema = true;

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
            this.profile.createPropertyBucket(this.profileSchema.propertyBucket);
            this.isFetchingSchema = false;
        });

    }

    public updateSpace(keyName, value, fromType): void {
        this.space[keyName] = this.schemaValuePipe.transform(value, fromType, this.profileSchema);
        const saveSpace$ = this.spacesService.updateSpace(this.space).subscribe();
        // | schemaValue: 'profile': schema
    }

    public toggleEditSpace(): void {
        this.space.inEditMode = !this.space.inEditMode;
    }

}
