import { SpaceOauthSettings } from '../../../models/space-settings.model';

import { SpaceItemComponent } from '../../../shared/component/space-item/space-item.component';
import {Component, OnInit, ViewChild} from '@angular/core';
import {SpacesService} from '../../../services/spaces.service';
import { ActivatedRoute, Router } from '@angular/router';
import {SpaceConfigComponent} from '../../../shared/component/space-config/space-config.component';
import {Space} from '../../../models/space.model';
import {Paths} from '../../../classes/paths.class';
import {DimensionSchema} from '../../../models/dimension-schema.model';
import {OauthSettingsService} from '../../../services/space/oauth-settings.service';
import {ProfileService} from '../../../services/profile/profile.service';
import {Profile} from '../../../models/profile.model';
import {Rain, RainDimension} from '../../../models/rain.model';
import {SpaceItemService} from '../../../shared/services/space-item/space-item.service';
import {RainService} from '../../../services/rain/rain.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'datawhore-view-space',
    templateUrl: 'view-space.component.html',
    styleUrls: ['view-space.component.less']
})

export class SpaceViewComponent implements OnInit {

    public space: Space;
    // public rain: Array<Rain> = [];
    // public profile: Profile;
    // public profileSchema: DimensionSchema;
    // protected isFetchingSchema = false;
    // protected hasDrops = false;
    // protected overrideSchemaPath: string = null;
    protected activeTab = 'rain';
    protected params = null;
    public retrieveSpace$: Observable<any> = new Observable<any>();

    // @ViewChild(SpaceItemComponent) protected profileComponent;

    constructor(private spacesService: SpacesService,
                private oauthService: OauthSettingsService,
                private activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {

        this.retrieveSpace$ = this.activatedRoute.params.do(params => {
            this.params = params;
            return params;
        })
        .mergeMap(params => this.spacesService.getSpace(params['space']))
        .do(space => {
            this.space = space;
            return space;
        })
        .switchMap(space => this.oauthService.getOauthSettings(space.name))
        .do(oauth => {
            // this.space = this.params['space'];
                this.space.oauth = oauth;
                // if (!this.space.oauth.connected) {
                //     this.activeTab = 'space';
                // }
                console.log(this.params);
                this.activeTab = this.params['tab'];
        });


        this.retrieveSpace$.subscribe(() => {

            window.document.title = `${this.space.name} | view space`;

        });
    }


    protected updateSpace(space: Space = this.space): void {
        this.spacesService.updateSpace(space).subscribe();
    }

    public removeSpace(): void {
        this.spacesService.removeSpace(this.space.name).subscribe();
    }

    public toggleEditSpace(): void {
        this.space.inEditMode = !this.space.inEditMode;
    }

    public setActiveTab(tabName: string): void {
        this.activeTab = tabName;
        this.activatedRoute.params['tab'] = tabName;
    }

}
