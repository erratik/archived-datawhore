import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Dimension} from '../../../models/profile.model';
import {ProfileService} from '../../../services/profile/profile.service';
import {Space} from '../../../models/space.model';
import {SpacesService} from '../../../services/spaces.service';
const objectPath = require('object-path');

@Component({
    selector: 'datawhore-space-item',
    templateUrl: './space-item.component.html',
    styleUrls: ['./space-item.component.less']
})
export class SpaceItemComponent implements OnInit {

    @Input() protected space: Space;
    @Input() protected type: string;
    @Input() protected properties: Array<Dimension>;
    protected schema: any;
    @Output() public linkingToSpace: EventEmitter<Space> = new EventEmitter<Space>();


    constructor(private profileService: ProfileService,
                private spacesService: SpacesService) {
    }

    ngOnInit() {
        const itemSchema$ = this[`${this.type}Service`].fetchSchema(this.space.name).do((rawSchema) => this.schema = rawSchema);
        itemSchema$.subscribe(() => {
            this.findSpaceLinks();
        });
    }

    public findSpaceLinks(): void {
        this.properties.forEach(property => {
            if (Object.keys(this.space).includes(property.friendlyName)) {
                property.linkableToSpace = true;
            }
        });
    }

    protected linkItemToSpace(property): void {
        this.space[property.friendlyName] = objectPath.get(this.schema, property.schemaPath);
        this.linkingToSpace.emit(this.space);
    }

    protected isItemLinked(property): boolean {
        if (objectPath.get(this.schema, property.schemaPath)) {
            console.log(objectPath.get(this.schema, property.schemaPath), this.space[property.friendlyName])
        }
        return this.space[property.friendlyName] === objectPath.get(this.schema, property.schemaPath);
    }
}
