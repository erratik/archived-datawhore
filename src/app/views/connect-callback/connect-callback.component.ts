import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SpacesService} from '../../services/spaces.service';
import {SpaceOauthSettings, OauthSettings, OauthExtras} from '../../models/space-settings.model';
import {SpaceModel} from '../../models/space.model';
import 'rxjs/add/operator/map';

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
                this.accessTokenRequestUrl = oauth.middlewareAuthUrl;

                for (let keyName of Object.keys(this.queryParams)) {
                    if (keyName.indexOf('token') !== -1 || keyName.indexOf('oauth') !== -1) {
                        this.skipTokenRequest = true;
                        oauth.extras.push(new OauthExtras(keyName, this.queryParams[keyName]));
                    } else {
                        oauth.settings.push(new OauthSettings(keyName, this.queryParams[keyName], keyName));
                    }
                }

                if (!this.skipTokenRequest) {

                    // todo: turn this into a function to share (enrich string with a PropObj)
                    // find all matched <keys> in a string that we have in a [{value ,label ,keyName}] aka PropObj
                    let regex = /(\<(.*?)\>)/gm, match;
                    while (match = regex.exec(this.accessTokenRequestUrl)) {
                        const matchedSetting = oauth.settings.filter(settings => settings.keyName === match[2]);
                        if (matchedSetting.length) {
                            this.accessTokenRequestUrl = oauth.castValues(this.accessTokenRequestUrl, match[1], matchedSetting[0].value);
                        }
                    }

                    // remove the code because fuck that noise
                    oauth.settings = oauth.settings.filter(settings => {
                        if (settings.label !== 'code') {
                            return settings;
                        }
                    });
                }

                this.settings = oauth;

                this.space.oauth = new SpaceOauthSettings(
                    oauth.settings.map(settings => new OauthSettings(settings.label, settings.value, settings.keyName)),
                    oauth.extras.map(settings => new OauthExtras(settings.label, settings.value)),
                    this.space.modified
                );

            })
            .switchMap(() => this.spacesService.requestAccessToken(this.accessTokenRequestUrl, this.space))
            .do((spaceWithCredentials) => {

                // save space with api credentials
                this.spacesService.updateSpace(spaceWithCredentials).subscribe(() => this.isRequestingAccessToken = false);

                // todo: redirect user to configs or maybe to a view for the space?

            });

        retrieveToken$.subscribe();

    }

}
