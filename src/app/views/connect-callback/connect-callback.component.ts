import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SpacesService} from '../../services/spaces.service';
import {Space} from '../../models/space.model';
import {OauthSettingsService} from '../../services/space/oauth-settings.service';
import {SpaceOauthSettings, OauthSettings, OauthExtras} from '../../models/space-settings.model';
import {Paths} from '../../classes/paths.class';
import 'rxjs/add/operator/map';

@Component({
    selector: 'datawhore-connect-callback',
    templateUrl: './connect-callback.component.html',
    styleUrls: ['./connect-callback.component.less']
})
export class ConnectCallbackComponent implements OnInit {

    private params: any = null;
    private queryParams: any = null;
    private space: Space = null;
    protected spaceName: string = null;
    protected isRequestingAccessToken = false;
    private skipTokenRequest = false;
    protected settings: SpaceOauthSettings = null;
    private oauth2 = {};


    constructor(private activatedRoute: ActivatedRoute,
                private oauthService: OauthSettingsService,
                private spacesService: SpacesService,
                private router: Router) {
    }

    ngOnInit() {

        const setupParams = this.activatedRoute.queryParams
            .do(parameters => this.queryParams = parameters)
            .switchMap(() => this.activatedRoute.params);

        setupParams.subscribe(parameters => {
            this.params = parameters;
            this.spaceName = this.params.space;
        });

        const retrieveSpace$ = this.spacesService.getSpace(this.spaceName)
            .do((spaceRetrieved) => this.space = spaceRetrieved);

        retrieveSpace$.subscribe(() => this.getAccessToken());

    }

    protected getAccessToken(): void {

        // get view-space-config
        const retrieveToken$ = this.spacesService.getSpace(this.spaceName)
            .do((spaceRetrieved) => this.space = spaceRetrieved)
            .switchMap(() => this.oauthService.getOauthSettings(this.spaceName))
            .do((oauth) => {

                this.isRequestingAccessToken = true;

                for (const keyName of Object.keys(this.queryParams)) {
                    if (keyName.indexOf('token') !== -1 || keyName.indexOf('oauth') !== -1) {
                        this.skipTokenRequest = this.spaceName !== 'facebook';
                        oauth.extras.push(new OauthExtras(keyName, this.queryParams[keyName]));
                    } else {
                        oauth.settings.push(new OauthSettings(keyName, this.queryParams[keyName], keyName));
                    }
                }

                this.settings = oauth;

                this.space = new Space(
                    this.spaceName,
                    this.space.modified,
                    new SpaceOauthSettings(
                        oauth.settings.map(settings => new OauthSettings(settings.label, settings.value, settings.keyName)),
                        oauth.extras.map(settings => new OauthExtras(settings.label, settings.value)),
                        this.space.modified
                    )
                );

                // need the middleware url to request token
                this.space.oauth.populateMatches(['authorizationUrl', 'middlewareAuthUrl']);

                // remove the code because fuck that noise
                // todo: check against defaults from SpaceOauthSettings
                this.space.oauth.settings = oauth.settings.filter(settings => {
                    if (settings.label !== 'code' && !settings.label.includes('oauth')) {
                        return settings;
                    }
                });

                if (this.skipTokenRequest) {
                    console.log('skipping token request?');
                    this.oauth2 = {
                        apiKey: this.space.oauth.settings.filter(settings => settings.keyName === 'apiKey')[0].value,
                        apiSecret: this.space.oauth.settings.filter(settings => settings.keyName === 'apiSecret')[0].value,
                        apiUrl: `https://${Paths.SPACE_API_URL[this.space.name]}/`
                    };
                }

            })
            .switchMap(() => this.oauthService.requestAccessToken(this.space, this.skipTokenRequest, this.oauth2))
            .do((spaceWithCredentials) => {
                console.log(spaceWithCredentials);
                // save space with api credentials
                this.oauthService.updateSpaceSettings(spaceWithCredentials).subscribe(() => {
                    this.isRequestingAccessToken = false;
                    this.router.navigate([`/space/${this.space.name}`]);
                });

            });

        retrieveToken$.subscribe();

    }

}
