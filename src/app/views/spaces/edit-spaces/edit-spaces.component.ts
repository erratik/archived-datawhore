import {Component, OnInit} from '@angular/core';
import {SpacesService} from '../../../services/spaces.service';
import {Space} from '../../../models/space.model';
import 'rxjs/add/operator/map';
import {Router} from '@angular/router';
import {OauthSettingsService} from '../../../services/space/oauth-settings.service';
import {SpaceItemService} from '../../../shared/services/space-item/space-item.service';

@Component({
    selector: 'datawhore-edit-spaces',
    templateUrl: 'edit-spaces.component.html',
    styleUrls: ['edit-spaces.component.less'],
    providers: [SpacesService]
})

export class EditSpacesComponent implements OnInit {

    protected isLoadingSpaces = true;
    protected spaces: Array<Space>;

    constructor(private spacesService: SpacesService,
                private spaceItemService: SpaceItemService,
                private oauthService: OauthSettingsService,
                private router: Router) {
    }

    ngOnInit() {

        const getSpaces$ = this.spacesService.getAllSpaces()
            .switchMap((spaces) => {
                spaces.forEach(space => {
                    const detailedSpaceInfo$ = this.spaceItemService.fetchSchema(space.name, 'rain')
                        .do((rainSchemas) => {
                            // debugger; 
                            space.rainSchemas = rainSchemas.map(({type, dropCount}) => {return {type, dropCount}})
                            // space.rainSchemas = rainSchemas.map((s) => {return {type: s.type, dropCount: s.dropCount}})
                            // debugger;
                        })
                        .switchMap(() => this.oauthService.getOauthSettings(space.name));

                    detailedSpaceInfo$.subscribe(settings => {
                        space.oauth = settings;
                    })
                });
                return this.spaces = spaces;
            })
            .do(() => this.isLoadingSpaces = false);

        getSpaces$.subscribe(() => {
            this.sortByKey(this.spaces, 'modified');
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
