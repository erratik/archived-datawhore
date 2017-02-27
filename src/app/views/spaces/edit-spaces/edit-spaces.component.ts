import {Component, OnInit, Input} from '@angular/core';
import {SpacesService} from '../../../services/spaces.service';
import {Space} from '../../../models/space.model';
import 'rxjs/add/operator/map';

@Component({
    selector: 'datawhore-edit-spaces',
    templateUrl: 'edit-spaces.component.html',
    styleUrls: ['edit-spaces.component.less'],
    providers: [SpacesService]
})
export class EditSpacesComponent implements OnInit {

    public addingSpaces: Array<Space>;
    @Input() public isAddingSpaces = false;
    protected isLoadingSpaces = true;
    protected spaces: Array<Space>;

    constructor(private spacesService: SpacesService) {
    }

    ngOnInit() {

        const getSpaces = this.spacesService.getAllSpaces()
            .do((spaces) => this.spaces = spaces)
            .do(() => this.isLoadingSpaces = false);

        getSpaces.subscribe();

    }


    protected cancelSpaceAdd(space: Space): void {
        this.addingSpaces = this.addingSpaces.filter(spaces => spaces.modified !== space.modified);
    }


}
