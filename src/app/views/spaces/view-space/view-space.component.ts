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
import {Rain, Dimension} from '../../../models/rain.model';
import {SpaceItemService} from '../../../shared/services/space-item/space-item.service';
import {RainService} from '../../../services/rain/rain.service';

@Component({
    selector: 'datawhore-view-space',
    templateUrl: 'view-space.component.html',
    styleUrls: ['view-space.component.less']
})

export class SpaceViewComponent extends SpaceConfigComponent implements OnInit {

    public space: Space = null;
    public rain: Array<Rain> = [];
    public rainSchemas: Array<any> = [];
    public profile: Profile = null;
    public profileSchema: any = null;
    public uploader: FileUploader;
    protected isFetchingSchema = false;
    protected schemaObjectOverride: string = null;
    protected activeTab = 'rain';
    private rainFetchUrl = null;

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
            .switchMap(() => this.getRain())
            .switchMap(() => this.getRawRain())
            .switchMap(() => this.getProfile())
            .mergeMap(() => this.getRawProfile())
            .do((profileSchema) => {
                this.profileSchema = new DimensionSchema(profileSchema['type'], profileSchema['content'], profileSchema['modified']);
            });

        spaceConfig$.subscribe(() => {

            this.rainFetchUrl = Paths.DROP_FETCH_URL[this.space.name];

            window.document.title = `${this.space.name} | view space`;

            // to know what's already selected and renamed
            if (this.profileSchema.propertyBucket) {
                this.profile.createPropertyBucket(this.profileSchema.propertyBucket);
                this.rain.forEach((r, i) => {
                    if (this.rainSchemas[i]) {
                        r.createPropertyBucket(this.rainSchemas[i].propertyBucket);
                    }
                });
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

    private getRain(): any {
        return this.rainService.getRain(this.space.name).do((rain) => {
            this.rain = rain.map(r => new Rain(
                this.space.name,
                r.dimensions.map(dims => new Dimension(dims.friendlyName, dims.schemaPath)),
                'drop',
                r.modified
            ));
        });
    }

    private getRawRain(): any {
        return this.spaceItemService.fetchSchema(this.space.name, 'rain').do((rain) => {
            this.spacesService.spaceRainSchemas = this.rainSchemas = rain.map(rainSchema => new DimensionSchema(rainSchema['type'], rainSchema['content'], rainSchema.modified));
        });
    }

    private getRawProfile(): any {
        return this.profileService.fetchSchema(this.space.name).do((profileSchema) => {
            this.profileSchema = new DimensionSchema(profileSchema['type'], profileSchema['content'], profileSchema.modified);
        });
    }

    protected writeRain(type: any = 'rain'): any {
        if (!this.rainFetchUrl) {
            console.error(`there is no profile getter path for ${this.space.name}`);
            return;
        }

        this.isFetchingSchema = true;

        // start with spaceOauthSettings values, for most /api/space/endpoint usages
        const data = Object.assign(this.spaceOauthSettings);
        data['apiEndpointUrl'] = typeof type === 'object' ? type.fetchUrl : this.rainFetchUrl;
        data['action'] = 'schema.write';
        data['type'] = typeof type === 'object' ? type.typeName : type;
        data['space'] = this.space.name;

        const profileSchema$ = this.spacesService.spaceEndpoint(this.space, data).do((resetRainSchema) => {

            if (resetRainSchema.type === data.type) {
                this.spacesService.spaceRainSchemas.push(new DimensionSchema(resetRainSchema['type'], resetRainSchema['content'], resetRainSchema.modified));
            }

            this.rainSchemas = this.spacesService.spaceRainSchemas;
        });

        profileSchema$.subscribe(() => {
            this.isFetchingSchema = false
        });

    }

    protected updateSpace(space: Space): void {
        this.spacesService.updateSpace(space).subscribe();
    }

    protected updateRainSchema(schemaData): any {
        console.log(schemaData, this);

        if (!this.rainSchemas) {
            this.rainSchemas = [new DimensionSchema(schemaData.type, schemaData.content, schemaData.modified)];

            debugger;
        }
        schemaData = [schemaData];
        this.rainSchemas.map(s => {
            // debugger;
            if (s.type === schemaData[0].type) {
                s = schemaData;
            }
        })
        // }

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
