import {Component, OnInit, Input} from '@angular/core';
import {SpaceModel} from '../../models/space.model';

@Component({
    selector: 'datawhore-connect-oauth',
    templateUrl: './connect-oauth.component.html',
    styleUrls: ['./connect-oauth.component.less']
})
export class ConnectOauthComponent implements OnInit {

    // get setting to connect
    @Input() protected space: SpaceModel;

    constructor() {
    }

    ngOnInit() {

        this.space.oauth['authorizationUrl'] = this.space.oauth.populateMatches('authorizationUrl', this.space.oauth);
        this.space.oauth['middlewareAuthUrl'] = this.space.oauth.populateMatches('middlewareAuthUrl', this.space.oauth);

    }


    // handle response

    // save settings with new params

}
