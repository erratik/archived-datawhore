import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Dimension} from '../../../models/profile.model';
import {ProfileService} from '../../../services/profile/profile.service';
import {Space} from '../../../models/space.model';
import {SpacesService} from '../../../services/spaces.service';
import {RainService} from '../../../services/rain/rain.service';
import {Observable} from 'rxjs';
const objectPath = require('object-path');

@Component({
    selector: 'datawhore-space-item',
    templateUrl: './space-item.component.html',
    styleUrls: ['./space-item.component.less']
})
export class SpaceItemComponent implements OnInit {

    @Output() public linkingToSpace = new EventEmitter<Space>();
    @Input() protected space: Space;
    @Input() protected type: string;
    @Input() protected properties: Array<Dimension>;
    public itemSchema$ = new Observable<any>();
    protected schema: any;

    constructor(private profileService: ProfileService,
                private rainService: RainService,
                private spacesService: SpacesService) {
    }

    ngOnInit() {
        this.type = this.type.includes('.') ? this.type.split('.')[0] : this.type;

        this.itemSchema$ = this[`${this.type}Service`].fetchSchema(this.space.name).do((rawSchema) => {
            this.schema = rawSchema.length ? rawSchema[0] : rawSchema;
            if (this.type === 'profile' && this.properties) {
                this.findSpaceLinks();
            }
        });
        this.itemSchema$.subscribe();
    }

    public findSpaceLinks(): void {
        const space = this.space;
        this.properties.forEach(property => {
            const spaceKeys = Object.keys(this.space);
            if (spaceKeys.includes(property.friendlyName)) {
                property.linkableToSpace = true;
            }
        });
    }

    protected linkItemToSpace(property): void {
        this.space[property.friendlyName] = objectPath.get(this.schema, property.schemaPath);
        this.linkingToSpace.emit(this.space);
    }

    protected isItemLinked(property): boolean {
        return this.space[property.friendlyName] === objectPath.get(this.schema, property.schemaPath);
    }
}
