import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {SpaceModel} from '../../../models/space.model';
import {ActivatedRoute, Router} from '@angular/router';
import {SpacesService} from '../../../services/spaces.service';
import {SpaceOauthSettings, OauthSettings, OauthExtras} from '../../../models/space-settings.model';
import {FileUploader} from 'ng2-file-upload';
import {Paths} from '../../../classes/paths.class';
import {Observable} from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'datawhore-space',
    templateUrl: 'space-config.component.html',
    styleUrls: ['space-config.component.less']
})
export class SpaceConfigComponent {

    public space: SpaceModel = null;
    public uploader: FileUploader;
    public retrieveSpace$: Observable<any> = new Observable<any>();
    public hasExpiryToken: boolean;
    public tokenExpiryDate: number;

    public toggleEditSpace(): void {
        this.space.inEditMode = !this.space.inEditMode;
    }


    constructor(private activatedRoute: ActivatedRoute,
                public spacesService: SpacesService) {

        this.retrieveSpace$ = this.activatedRoute.params.do(params => {
                return params;
            })
            .mergeMap(params => this.spacesService.getSpace(params['space']))
            .switchMap(spaceModel => {
                this.space = spaceModel;
                this.uploader = new FileUploader({url: `${Paths.DATAWHORE_API_URL}/upload/${this.space.name}/space/icon`});
                this.uploader.onCompleteItem = (item, response, status, header) => {
                    if (status === 200) {
                        const res = JSON.parse(response);
                        this.space.icon = res.icon;
                        this.space.modified = res.modified;
                    }
                };

                return this.spacesService.getOauthSettings(spaceModel.name);
            })
            .do(oauth => {

                this.space = new SpaceModel(
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

                // check if we have refresh token data
                const extras = this.space.oauth.extras.filter(extra => {
                    if (extra.label.indexOf('expire') !== -1) {
                        this.hasExpiryToken = true;
                        this.tokenExpiryDate = oauth.modified + Number(extra.value) * 1000;
                    }
                    return extra.value;
                });
                const a = moment(oauth.modified);
                const b = moment(this.tokenExpiryDate);
                console.log(a.to(b), new Date(oauth.modified), new Date(this.tokenExpiryDate), new Date());
                if (this.tokenExpiryDate < Date.now()) {
                    window.location.href = this.space.oauth.authorizationUrl;
                }
                return this.space;
            });
    }


}
