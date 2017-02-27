import {Component} from '@angular/core';
import {Space} from '../../../models/space.model';
import {ActivatedRoute} from '@angular/router';
import {SpacesService} from '../../../services/spaces.service';
import {SpaceOauthSettings, OauthSettings, OauthExtras} from '../../../models/space-settings.model';
import {Paths} from '../../../classes/paths.class';
import {Observable} from 'rxjs';
import {OauthSettingsService} from '../../../services/space/oauth-settings.service';
import {ProfileService} from '../../../services/profile/profile.service';
import {Profile} from '../../../models/profile.model';

@Component({
    selector: 'datawhore-space',
    templateUrl: 'space-config.component.html',
    styleUrls: ['space-config.component.less']
})
export class SpaceConfigComponent {

    public space: Space = null;
    public profile: Profile = null;
    public hasExpiryToken: boolean;
    public tokenExpiryDate: number;
    public oauth2 = {};
    public retrieveSpace$: Observable<SpaceOauthSettings> = new Observable<SpaceOauthSettings>();

    public toggleEditSpace(): void {
        this.space.inEditMode = !this.space.inEditMode;
    }

    constructor(public spacesService: SpacesService,
                public oauthService: OauthSettingsService,
                public profileService?: ProfileService,
                private activatedRoute?: ActivatedRoute) {

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
                    new SpaceOauthSettings(
                        oauth.settings.map(settings => new OauthSettings(settings.label, settings.value, settings.keyName)),
                        oauth.extras.map(settings => new OauthExtras(settings.label, settings.value)),
                        oauth.modified,
                        oauth.connected
                    ),
                    false,
                    this.space.icon
                );

                this.space.oauth.populateMatches(['authorizationUrl', 'middlewareAuthUrl']);

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

                this.oauth2 = {
                    accessToken: this.space.oauth.extras.filter(settings => settings.label === 'accessToken')[0].value,
                    apiKey: this.space.oauth.settings.filter(settings => settings.keyName === 'apiKey')[0].value,
                    apiSecret: this.space.oauth.settings.filter(settings => settings.keyName === 'apiSecret')[0].value,
                    apiUrl: Paths.SPACE_API_URL[this.space.name]
                };

                return this.space;
            });
    }

    public newDimensions(data): any {
        console.log(data[0]);
        this[data[1]].properties = data[0];
    }



}
