import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SpacesService} from '../../services/spaces.service';
import 'rxjs/add/operator/map';
import {SpaceOauthSettings, OauthSettings} from '../../models/space-settings.model';
import {Paths} from '../../classes/paths.class';
import {SpaceModel} from '../../models/space.model';

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


    }

    // todo: turn this into a function to share
    private castValues(haystack, needle, replace): string {
        return haystack.replace(needle, replace);
    }
//
    protected getAccessToken(): void {

        // get spaceName
        const space = this.spacesService.getSpace(this.spaceName)
            .do((spaceRetrieved) => this.space = spaceRetrieved)
            .switchMap(() => this.spacesService.getOauthSettings(this.spaceName))
            .do((oauth) => {

                this.isRequestingAccessToken = true;
                this.accessTokenRequestUrl = oauth.middlewareAuthUrl;

                console.log(this.accessTokenRequestUrl);
                // this may only be for moves, so far
                oauth.settings.push(new OauthSettings('code', this.queryParams.code, 'code'));
                oauth.settings.push(new OauthSettings('redirectUrl', Paths.DATAWHORE_API_CALLBACK_URL + '/' + this.spaceName + '/', 'redirectUrl'));

                // todo: turn this into a function to share
                // find all matched <keys> in a string that we have in a [{value ,label ,keyName}] aka PropObj
                let regex = /(\<(.*?)\>)/gm, match;
                while (match = regex.exec(this.accessTokenRequestUrl)) {
                    const matchedSetting = oauth.settings.filter(settings => settings.keyName === match[2]);
                    if (matchedSetting.length) {
                        this.accessTokenRequestUrl = this.castValues(this.accessTokenRequestUrl, match[1], matchedSetting[0].value);
                    }
                }

                // remove the added items
                oauth.settings = oauth.settings.filter(settings => {
                    if (settings.label !== 'code'
                        && settings.label !== 'redirectUrl') {
                        return settings;
                    }
                });
                this.settings = oauth;

                this.space.oauth = new SpaceOauthSettings(
                    oauth.settings.map(settings => new OauthSettings(settings.label, settings.value, settings.keyName)),
                    null,
                    this.space.modified
                );


            })
            .switchMap(() => this.spacesService.requestAccessToken(this.accessTokenRequestUrl, this.space))
            .do((spaceWithCredentials) => {

                // save space with api credentials
                this.spacesService.updateSpace(spaceWithCredentials).subscribe(updatingSpaceRes => {
                    console.log(updatingSpaceRes);
                    this.isRequestingAccessToken = false;
                });

                // todo: redirect user to configs or maybe to a view for the space?

            });

        space.subscribe();

    }

}
