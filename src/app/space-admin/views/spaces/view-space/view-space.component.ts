import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Paths } from '../../../../shared/classes/paths.class';
import { SpaceOauthSettings } from '../../../../shared/models/space-settings.model';
import { Space } from '../../../../shared/models/space.model';
import { Profile } from '../../../../shared/models/profile.model';
import { Rain, RainDimension } from '../../../../shared/models/rain.model';
import { DimensionSchema } from '../../../../shared/models/dimension-schema.model';
import { SpacesService } from '../../../../shared/services/spaces.service';
import { ProfileService } from '../../../../shared/services/profile.service';
import { SpaceItemService } from '../../../../shared/services/space-item.service';
import { RainService } from '../../../../shared/services/rain.service';
import { SpaceItemComponent } from '../../../../shared/component/space-item/space-item.component';

import { OauthSettingsService } from '../../../services/oauth-settings.service';
import { SpaceConfigComponent } from '../../../component/space-config/space-config.component';

@Component({
    selector: 'admin-space-view',
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
        private activatedRoute: ActivatedRoute,
        public router: Router) {
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
        // debugger;
        this.router.navigate(['/space', this.space.name]);
        this.activatedRoute.params['tab'] = tabName;
    }

}
