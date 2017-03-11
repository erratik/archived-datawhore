import {Component, Output, EventEmitter, ViewChild} from '@angular/core';
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

@Component({
    selector: 'datawhore-space-config',
    templateUrl: 'space-config.component.html',
    styleUrls: ['space-config.component.less']
})
export class SpaceConfigComponent {

    public space: Space = null;
    public profile: Profile = null;
    public hasExpiryToken: boolean;
    public tokenExpiryDate: number;
    public spaceOauthSettings = null;
    public retrieveSpace$: Observable<SpaceOauthSettings> = new Observable<SpaceOauthSettings>();
    @Output() public gotOauthSettings: EventEmitter<SpaceOauthSettings> = new EventEmitter<SpaceOauthSettings>();
    @ViewChild(SpaceItemComponent) public spaceItemComponent;
    

    constructor(public spacesService: SpacesService,
                public oauthService: OauthSettingsService,
                public profileService?: ProfileService,
                private activatedRoute?: ActivatedRoute,
                public router?: Router) {

        this.retrieveSpace$ = this.activatedRoute.params.do(params => {
                return params;
            })
            .mergeMap(params => this.spacesService.getSpace(params['space']))
            .switchMap(spaceModel => {
                this.space = spaceModel;
                return this.oauthService.getOauthSettings(spaceModel.name);
            })
            .do(oauth => {


                this.space = new Space(
                    this.space.name,
                    this.space.modified,
                    oauth,
                    false,
                    this.space.icon,
                    this.space.username,
                    this.space.description,
                    this.space.avatar
                );

                this.spaceOauthSettings = {
                    apiKey: this.space.oauth.settings.filter(settings => settings.keyName === 'apiKey')[0].value,
                    apiSecret: this.space.oauth.settings.filter(settings => settings.keyName === 'apiSecret')[0].value,
                    apiUrl: Paths.SPACE_API_URL[this.space.name]
                };

                // console.log(this.space.oauth.extras.filter(settings => settings.label === 'accessToken'))
                if (this.space.oauth.connected) {
                    this.spaceOauthSettings.accessToken = this.space.oauth.extras.filter(settings => settings.label === 'accessToken')[0].value;
                    if (this.space.oauth.extras.filter(settings => settings.label === 'tokenSecret').length) {
                        this.spaceOauthSettings.tokenSecret = this.space.oauth.extras.filter(settings => settings.label === 'tokenSecret')[0].value;
                    }
                    // check if we have refresh token data and when it expires
                    this.space.oauth.extras.filter(extra => {
                        if (extra.label.indexOf('expire') !== -1) {
                            this.hasExpiryToken = true;
                            this.tokenExpiryDate = oauth.modified + Number(extra.value) * 1000;
                        }
                        return extra.value;
                    });


                    if (this.tokenExpiryDate < Date.now()) {
                        // todo: offer a manual way to do refresh token
                        // todo: display warning when less than 30 minutes
                        // todo: make sure it happens when we start working and loading posts, etc
                        window.location.href = this.space.oauth.authorizationUrl;
                    }
                }

                this.gotOauthSettings.emit(this.space.oauth);
                return this.space;
            });
    }

    public updateSpaceSettings(): any {
        this.oauthService.updateSpaceSettings(this.space).subscribe((settings) => {
            this.space.oauth = settings;
            this.spaceItemComponent.findSpaceLinks();
            this.space.inEditMode = false;
        });
    }


    public newDimensions(data): any {
        console.log(data[0]);
        this[data[1]].properties = data[0];
    }

}
