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

        this.space.oauth.populateMatches(['authorizationUrl', 'middlewareAuthUrl']);
    }

    // handle response

    // save settings with new params

}
