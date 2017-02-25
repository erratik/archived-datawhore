import {Component, OnInit, EventEmitter} from '@angular/core';
import {SpacesService} from '../../../services/spaces.service';
import {ActivatedRoute} from '@angular/router';
import {SpaceConfigComponent} from '../../../shared/component/space-config/space-config.component';
import {SpaceModel} from '../../../models/space.model';
import {Paths} from '../../../classes/paths.class';
import {DimensionSchema} from '../../../models/dimension-schema.model';
import {OauthSettingsService} from '../../../services/space/oauth-settings.service';
import {FileUploader} from 'ng2-file-upload';

@Component({
    selector: 'datawhore-view-space',
    templateUrl: 'view-space.component.html',
    styleUrls: ['view-space.component.less']
})

export class SpaceViewComponent extends SpaceConfigComponent implements OnInit {

    public space: SpaceModel = null;
    public profileSchema: any = null;
    public uploader: FileUploader;
    public isLoading = new EventEmitter<boolean>();

    constructor(spacesService: SpacesService,
                oauthService: OauthSettingsService,
                activatedRoute: ActivatedRoute) {
        super(spacesService, oauthService, activatedRoute);
    }

    ngOnInit() {

        this.retrieveSpace$.subscribe(() => {
            this.fetchRawProfile();

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

    public toggleEditSpace(): void {
        this.space.inEditMode = !this.space.inEditMode;
    }

    private fetchRawProfile(): any {

        const data = {
            action: 'schemas.get',
            type: 'profile',
            space: this.space.name
        };

        const profileSchema$ = this.spacesService.spaceEndpoint(this.space, data, encodeURI('space/schemas')).do((profileSchema) => {
                this.profileSchema = new DimensionSchema(profileSchema['type'], profileSchema['content'], profileSchema.modified);
            });

        profileSchema$.subscribe(() => {
            console.log(this.profileSchema.propertyBucket);
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


}
