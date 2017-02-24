import {Component, OnInit, AfterViewInit} from '@angular/core';
import {SpacesService} from '../../../services/spaces.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SpaceConfigComponent} from '../../../shared/component/space-config/space-config.component';
import {SpaceModel} from '../../../models/space.model';
import {Paths} from '../../../classes/paths.class';

@Component({
    selector: 'datawhore-view-space',
    templateUrl: 'view-space.component.html',
    styleUrls: ['view-space.component.less']
})

export class SpaceViewComponent extends SpaceConfigComponent implements OnInit {

    public space: SpaceModel = null;

    constructor(activatedRoute: ActivatedRoute,
                spacesService: SpacesService) {
        super(activatedRoute, spacesService);
    }

    ngOnInit() {

        this.retrieveSpace$.subscribe();

    }

    public toggleEditSpace(): void {
        this.space.inEditMode = !this.space.inEditMode;
    }

    protected getSpaceProfile(): any {
        const apiKey = this.space.oauth.settings.filter(settings => settings.keyName === 'apiKey')[0].value;
        const getProfile$ = this.spacesService.spaceEndpoint(Paths.PROFILE_FETCH_URL[this.space.name], {api_key: apiKey});

        getProfile$.subscribe();
    }


}
