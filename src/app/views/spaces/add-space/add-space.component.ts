import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {Space} from '../../../models/space.model';
import {SpacesService} from '../../../services/spaces.service';

@Component({
    selector: 'datawhore-add-space',
    templateUrl: './add-space.component.html',
    styleUrls: ['./add-space.component.less']
})
export class AddSpaceComponent implements OnInit {

    protected spaces: Array<Space> = [];
    @Output() public addedSpace: EventEmitter<Space> = new EventEmitter<Space>();

    constructor(private spacesService: SpacesService) {
    }

    ngOnInit() {
    }

    public newSpace(): void {
        this.spaces.push(new Space('', Date.now()));
    }

    protected addSpace(addingSpace: Space): void {
        this.spacesService.updateSpace(addingSpace).subscribe((space) => this.addedSpace.emit(space));
    }


}
