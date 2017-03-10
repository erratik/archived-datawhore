import {Component, OnInit} from '@angular/core';
import {SpacesService} from '../../../services/spaces.service';
import {Space} from '../../../models/space.model';
import 'rxjs/add/operator/map';
import {Router} from '@angular/router';

@Component({
    selector: 'datawhore-edit-spaces',
    templateUrl: 'edit-spaces.component.html',
    styleUrls: ['edit-spaces.component.less'],
    providers: [SpacesService]
})

export class EditSpacesComponent implements OnInit {

    protected isLoadingSpaces = true;
    protected spaces: Array<any>;

    constructor(private spacesService: SpacesService, private router: Router) {}

    ngOnInit() {

        const getSpaces$ = this.spacesService.getAllSpaces()
            .switchMap((spaces) => this.spaces = spaces)
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
        // this.spaces.unshift(space);
        this.router.navigate([`/space/${space.name}`]);
    }

}
