import { Component, OnInit } from '@angular/core';
import { SpacesService } from '../../../services/spaces.service';
import { Space } from '../../../models/space.model';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { OauthSettingsService } from '../../../services/space/oauth-settings.service';
import { SpaceItemService } from '../../../shared/services/space-item/space-item.service';

@Component({
    selector: 'datawhore-edit-spaces',
    templateUrl: 'edit-spaces.component.html',
    styleUrls: ['edit-spaces.component.less'],
    providers: [SpacesService]
})


export class EditSpacesComponent implements OnInit {

    protected isLoadingSpaces = true;
    protected spaces: Array<Space>;
    protected dropCounts: any = {};

    constructor(private spacesService: SpacesService,
        private spaceItemService: SpaceItemService,
        private oauthService: OauthSettingsService,
        private router: Router) {
    }

    ngOnInit() {

        const getSpaces$ = this.spacesService.getAllSpaces()
            .do((spaces) => {

                const spaceList = spaces.map(({ name }) => name);
                const getDropCounts$ = this.spaceItemService.fetchSchemas(spaceList, 'rain')
                    .switchMap(() => this.spacesService.getSpaceStatus(spaceList));

                getDropCounts$.subscribe((spaceStatus) => {
                    console.log('spaces status:', spaceStatus);
                    this.isLoadingSpaces = false;
                });

                return this.spaces = spaces;
            });

        getSpaces$.subscribe();

    }

    public sortByKey(array, key, asc = true) {
        array.sort(function (a, b) {
            const x = a[key];
            const y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        if (asc) {
            array.reverse();
        }
    }

    public onAddedSpace(space: Space): void {
        this.router.navigate([`/space/${space.name}`]);
        // this.spaces.unshift(space);
    }




}
