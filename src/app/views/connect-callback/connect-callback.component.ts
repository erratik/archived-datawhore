import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SpacesService} from '../../services/spaces.service';
import {SpaceOauthSettings, OauthSettings, OauthExtras} from '../../models/space-settings.model';
import {SpaceModel} from '../../models/space.model';
import 'rxjs/add/operator/map';
import {Http} from '@angular/http';

@Component({
    selector: 'datawhore-connect-callback',
    templateUrl: './connect-callback.component.html',
    styleUrls: ['./connect-callback.component.less']
})
export class ConnectCallbackComponent implements OnInit {

    private params: any = null;
    private queryParams: any = null;
    private space: SpaceModel = null;
    protected spaceName: string = null;
    protected isRequestingAccessToken = false;
    private accessTokenRequestUrl = '';
    private skipTokenRequest = false;
    protected settings: SpaceOauthSettings = null;


    constructor(private activatedRoute: ActivatedRoute,
                private router: Router,
                private spacesService: SpacesService) {
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

        retrieveSpace$.subscribe();

    }

    protected getAccessToken(): void {

        // get space
        const retrieveToken$ = this.spacesService.getSpace(this.spaceName)
            .do((spaceRetrieved) => this.space = spaceRetrieved)
            .switchMap(() => this.spacesService.getOauthSettings(this.spaceName))
            .do((oauth) => {

                this.isRequestingAccessToken = true;

                for (let keyName of Object.keys(this.queryParams)) {
                    if (keyName.indexOf('token') !== -1 || keyName.indexOf('oauth') !== -1) {
                        this.skipTokenRequest = this.spaceName !== 'facebook';
                        oauth.extras.push(new OauthExtras(keyName, this.queryParams[keyName]));
                    } else {
                        oauth.settings.push(new OauthSettings(keyName, this.queryParams[keyName], keyName));
                    }
                }

                this.settings = oauth;

                this.space = new SpaceModel(
                    this.spaceName,
                    this.space.modified,
                    new SpaceOauthSettings(
                        oauth.settings.map(settings => new OauthSettings(settings.label, settings.value, settings.keyName)),
                        oauth.extras.map(settings => new OauthExtras(settings.label, settings.value)),
                        this.space.modified
                    )
                );

                this.space.toSpaceSettings({
                    name: this.spaceName,
                    modified: this.space.modified,
                    oauth: this.space.oauth
                });
                this.space.oauth.populateMatches(['authorizationUrl', 'middlewareAuthUrl']);

                // remove the code because fuck that noise
                this.space.oauth.settings = oauth.settings.filter(settings => {
                    if (settings.label !== 'code') {
                        return settings;
                    }
                });

            })
            .switchMap(() => this.spacesService.requestAccessToken(this.space, this.skipTokenRequest))
            .do((spaceWithCredentials) => {

                // save space with api credentials
                this.spacesService.updateSpace(spaceWithCredentials).subscribe(() => {
                    this.isRequestingAccessToken = false;
                    this.router.navigate(['/']);
                });

            });

        retrieveToken$.subscribe();

    }

}
