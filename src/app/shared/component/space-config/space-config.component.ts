import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {Space} from '../../../models/space.model';
import {ActivatedRoute, Router} from '@angular/router';
import {SpacesService} from '../../../services/spaces.service';
import {SpaceOauthSettings} from '../../../models/space-settings.model';
import {Paths} from '../../../classes/paths.class';
import {Observable} from 'rxjs';
import {OauthSettingsService} from '../../../services/space/oauth-settings.service';
import {ProfileService} from '../../../services/profile/profile.service';
import {Profile} from '../../../models/profile.model';
import {SpaceItemComponent} from '../space-item/space-item.component';
import {SpaceItemService} from '../../services/space-item/space-item.service';
import {RainService} from '../../../services/rain/rain.service';
import {FileUploader} from 'ng2-file-upload';


@Component({
    selector: 'datawhore-space-config',
    templateUrl: 'space-config.component.html',
    styleUrls: ['space-config.component.less']
})
export class SpaceConfigComponent implements OnInit {

    @Input() public space: Space;
    @Input() public spaceOauthSettings;
    public uploader: FileUploader;

    public retrieveSpace$: Observable<SpaceOauthSettings> = new Observable<SpaceOauthSettings>();
    @Output() public gotOauthSettings: EventEmitter<SpaceOauthSettings> = new EventEmitter<SpaceOauthSettings>();
    @Output() public onRemoveSpace: EventEmitter<any> = new EventEmitter<any>();
    @Output() public onToggleEditSpace: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild(SpaceItemComponent) public spaceItemComponent;

    constructor(public spacesService: SpacesService,
                public oauthService: OauthSettingsService,
                public spaceItemService?: SpaceItemService,
                public profileService?: ProfileService,
                public rainService?: RainService,
                private activatedRoute?: ActivatedRoute,
                public router?: Router) {

        this.retrieveSpace$ = this.activatedRoute.params.do(params => params)
            .mergeMap(params => this.spacesService.getSpace(params['space']))
            .switchMap(space => this.oauthService.getOauthSettings(space.name))
            .do(oauth => {
                this.space = this.spacesService.space;
                this.space.oauth = oauth;

                this.spaceOauthSettings = {
                    apiKey: this.space.oauth.settings.filter(settings => settings.keyName === 'apiKey')[0].value,
                    apiSecret: this.space.oauth.settings.filter(settings => settings.keyName === 'apiSecret')[0].value,
                    apiUrl: Paths.SPACE_API_URL[this.space.name]
                };

                // todo: this is disgusting, make it look nice!
                // this could easily be turned into a function
                // this.space.oauth.extras.filter(settings => settings.label === 'accessToken')
                if (this.space.oauth.connected) {
                    this.spaceOauthSettings.accessToken = this.space.oauth.extras.filter(settings => settings.label === 'accessToken')[0].value;
                    if (this.space.oauth.extras.filter(settings => settings.label === 'tokenSecret').length) {
                        this.spaceOauthSettings.tokenSecret = this.space.oauth.extras.filter(settings => settings.label === 'tokenSecret')[0].value;
                    }
                    if (this.space.oauth.extras.filter(settings => settings.label === 'refreshToken').length) {
                        this.spaceOauthSettings.refreshToken = this.space.oauth.extras.filter(settings => settings.label === 'refreshToken')[0].value;
                    }
                }

                this.gotOauthSettings.emit(this.space.oauth);
                this.spacesService.space = this.space;
            });
    }

    ngOnInit() {
        this.setSpace();

        this.uploader = new FileUploader({url: `${Paths.DATAWHORE_API_URL}/upload/${this.space.name}/space/icon`});
        this.uploader.onCompleteItem = (item, response, status) => {
            if (status === 200) {
                const res = JSON.parse(response);
                this.space.icon = res.icon;
                this.space.modified = res.modified;
            }
        };
    }

    public setSpace(): void {
        this.space = this.spacesService.space;
    }

    public updateSpaceSettings(): any {
        this.oauthService.updateSpaceSettings(this.space).subscribe((settings) => {
            this.space.oauth = settings;
            this.space.inEditMode = false;
        });
    }

    public newDimensions(data): any {
        console.log(data);
        // check if there is an index for an array
        if (data[3]) {
            this[data[1]][data[2]].properties = data[0];
        } else {
            this[data[1]].properties = data[0];
            // this.spaceItemComponent.findSpaceLinks();
        }
    }

}
