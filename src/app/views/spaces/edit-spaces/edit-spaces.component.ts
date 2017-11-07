import { retry } from 'rxjs/operator/retry';
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

    public isLoadingSpaces = true;
    public spaces: Array<Space>;
    public dropCounts: any = {};

    constructor(private spacesService: SpacesService,
        private spaceItemService: SpaceItemService,
        private oauthService: OauthSettingsService,
        private router: Router) {
    }

    ngOnInit() {

        const getSpaces$ = this.spacesService.getAllSpaces()
            .switchMap((spaces) => {
                this.spaces = spaces;
                const spaceList = spaces.map((s) => s.name);
                return this.spacesService.getSpaceStatus(spaceList);
            })
            // TODO: sucks to have to wait on space to exist! figure out a way to let it load?
            .switchMap(spaceStatus => {
                const spaceList = spaceStatus.filter(s => s.connected === true).map(s => s.space);
                this.spaces = this.spaces.map(space => {
                    // Object.keys(space).forEach((key) => (space[key] == null) && delete space[key]);
                    space.connected = spaceList.includes(space.name);
                    return space;
                });
                return this.spaceItemService.fetchSchemas(spaceList, 'rain');
            });

            getSpaces$.subscribe((spaceCounts) => {
                // console.log('spaces:', this.spaces);
                // console.log('counts:', spaceCounts);
                this.spaces = this.spaces.map(s => {
                    s.counts = spaceCounts[s.name];
                    return s;
                });
                this.isLoadingSpaces = false;
            });

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
