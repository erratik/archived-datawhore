import {Component, OnInit, ViewChild} from '@angular/core';
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
import {ProfileFormComponent} from '../../profile/profile-form/profile-form.component';
const objectPath = require('object-path');

@Component({
    selector: 'datawhore-view-space',
    templateUrl: 'view-space.component.html',
    styleUrls: ['view-space.component.less']
})

export class SpaceViewComponent extends SpaceConfigComponent implements OnInit {

    public space: Space = null;
    private profileFetchUrl = null;
    public profile: Profile = null;
    public profileSchema: any = null;
    public uploader: FileUploader;
    protected isFetchingSchema = false;
    protected isProfileReset = false;
    protected schemaObjectOverride: string = null;
    protected activeTab = 'profile';
    @ViewChild(ProfileFormComponent) protected profileFormComponent;

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

            this.profileFetchUrl = Paths.PROFILE_FETCH_URL[this.space.name];
            window.document.title = `${this.space.name} | view space`;

            if (this.profileSchema.propertyBucket) {
                this.profile.createPropertyBucket(this.profileSchema.propertyBucket);
            }


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
        return this.profileService.fetchSchema(this.space.name).do((profileSchema) => {
            this.profileSchema = new DimensionSchema(profileSchema['type'], profileSchema['content'], profileSchema.modified);
        });
    }

    protected updateSpace(space: Space): void {
        this.spacesService.updateSpace(space).subscribe();
    }

    public removeSpace(): void {
        this.spacesService.removeSpace(this.space.name).subscribe();
    }

    public toggleEditSpace(): void {
        this.space.inEditMode = !this.space.inEditMode;
    }

    public setActiveTab(tabName: string): void {
        this.activeTab = tabName;
    }


}
