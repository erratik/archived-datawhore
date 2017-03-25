
import { SpaceItemComponent } from '../../../shared/component/space-item/space-item.component';
import {Component, OnInit, ViewChild} from '@angular/core';
import {SpacesService} from '../../../services/spaces.service';
import { ActivatedRoute, Router } from '@angular/router';
import {SpaceConfigComponent} from '../../../shared/component/space-config/space-config.component';
import {Space} from '../../../models/space.model';
import {Paths} from '../../../classes/paths.class';
import {DimensionSchema} from '../../../models/dimension-schema.model';
import {OauthSettingsService} from '../../../services/space/oauth-settings.service';
import {ProfileService} from '../../../services/profile/profile.service';
import {Profile} from '../../../models/profile.model';
import {Rain, RainDimension} from '../../../models/rain.model';
import {SpaceItemService} from '../../../shared/services/space-item/space-item.service';
import {RainService} from '../../../services/rain/rain.service';

@Component({
    selector: 'datawhore-view-space',
    templateUrl: 'view-space.component.html',
    styleUrls: ['view-space.component.less']
})

export class SpaceViewComponent extends SpaceConfigComponent implements OnInit {

    public space: Space;
    public rain: Array<Rain> = [];
    public profile: Profile;
    public profileSchema: DimensionSchema;
    protected isFetchingSchema = false;
    protected overrideSchemaPath: string = null;
    protected activeTab = 'rain';
    @ViewChild(SpaceItemComponent) protected profileComponent;

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
            .mergeMap(() => this.getRawProfile())
            .do((profileSchema) => {
                this.profileSchema = new DimensionSchema(profileSchema['type'], profileSchema['content'], profileSchema['modified']);
                if (!this.space.oauth.connected) {
                    this.activeTab = 'space';
                } else if (!this.rainService.rainSchemas.length) {
                    this.activeTab = 'profile';
                }
                if (this.profile.properties) {
                    this.activeTab = 'rain';
                }
            });


        spaceConfig$.subscribe(() => {

            window.document.title = `${this.space.name} | view space`;

            // to know what's already selected and renamed
            if (this.profileSchema.propertyBucket) {
                this.profile.createPropertyBucket(this.profileSchema.propertyBucket);
            }
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

    protected updateSpace(space: Space = this.space): void {
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

        // this.activatedRoute.params['tab'] = this.activeTab;
    }

}
