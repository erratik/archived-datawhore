import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Dimension} from '../../../models/profile.model';
import {RainDimension} from '../../../models/rain.model';
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

    protected schema: any;
    @Input() protected properties: any[];
    @Input() protected space: Space;
    @Input() protected type: string;
    @Output() public linkingToSpace = new EventEmitter<Space>();
    public itemSchema$ = new Observable<any>();

    constructor(private profileService: ProfileService,
                private rainService: RainService,
                private spacesService: SpacesService) {}

    ngOnInit() {
        this.type = this.type.includes('.') ? this.type.split('.')[0] : this.type;

        const itemSchema$ = this[`${this.type}Service`].fetchSchema(this.space.name).do((rawSchema) => {
            this.schema = rawSchema.length ? rawSchema[0] : rawSchema;
            if (this.type === 'profile' && this.properties) {
                console.log(this.properties);
                this.profileService.findSpaceLinks(this.properties, this.space);
            } else if (this.type !== 'profile' && this.rainService.type.includes('rain')) {
                this.properties = this.rainService.rain.filter(rain => rain.rainType === this.rainService.type)[0].properties;
            }
        });

        itemSchema$.subscribe();
    }


    protected linkItemToSpace(property): void {
        this.space[property.friendlyName] = objectPath.get(this.schema, property.schemaPath);
        this.linkingToSpace.emit(this.space);
    }

    protected isItemLinked(property): boolean {
        return this.space[property.friendlyName] === objectPath.get(this.schema, property.schemaPath);
    }
}
