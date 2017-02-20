import {Component, OnInit, Input} from '@angular/core';
import {SpacesService} from '../spaces.service';
import {Router} from '@angular/router';
import {SpaceModel} from '../../models/space.model';

@Component({
    selector: 'datawhore-connect-oauth',
    templateUrl: './connect-oauth.component.html',
    styleUrls: ['./connect-oauth.component.less']
})
export class ConnectOauthComponent implements OnInit {

    // get setting to connect
    @Input() protected space: SpaceModel;

    constructor(private spacesService: SpacesService, private router: Router) {
    }

    ngOnInit() {

        let regex = /(\<(.*?)\>)/gm, match;
        while (match = regex.exec(this.space.oauth.authorizationUrl)) {
            const matchedSetting = this.space.oauth.settings.filter(settings => settings.keyName === match[2]);
            this.space.oauth.authorizationUrl = this.castValues(this.space.oauth.authorizationUrl, match[1], matchedSetting[0].value);
            // console.log('Found', match[1], 'at', match.index);
        }

        console.log(this.space.oauth);

    }

    private castValues(haystack, needle, replace): string {
        return haystack.replace(needle, replace);
    }

    // http request to connect
    protected connectSpace(): void {

        const connectToSpace = this.spacesService.connect(this.space, this.space.oauth.authorizationUrl);
        // .do((spaces) => this.spaces = spaces)
        // .do(() => this.isLoadingSpaces = false)
        // .switchMap(() => this.getSpaceOauthSettings());

        connectToSpace.subscribe();
    }

    // handle response

    // save settings with new params

}
