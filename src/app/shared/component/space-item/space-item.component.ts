import { pbkdf2 } from 'crypto';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {Dimension} from '../../../models/profile.model';
import {RainDimension} from '../../../models/rain.model';
import {Space} from '../../../models/space.model';
import {ProfileService} from '../../../services/profile.service';
import {SpacesService} from '../../../services/spaces.service';
import {RainService} from '../../../services/rain.service';
import {Observable} from 'rxjs';
const objectPath = require('object-path');

@Component({
    selector: 'datawhore-space-item',
    templateUrl: './space-item.component.html',
    styleUrls: ['./space-item.component.less']
})
export class SpaceItemComponent implements OnInit, OnDestroy {

    @Input() public schema: any;
    @Input() public properties: any[];
    @Input() public space: Space;
    @Input() public type: string;
    @Output() public linkingToSpace = new EventEmitter<Space>();
    public itemSchema$ = new Observable<any>();
    public obsRx;

    constructor(private profileService: ProfileService,
                public rainService: RainService,
                public spacesService: SpacesService) {}

    ngOnInit() {

       const schemaServiceName = this.type.includes('.') ? this.type.split('.')[0] : JSON.parse(JSON.stringify(this.type));
       this.itemSchema$ = this.obsRx = this[`${schemaServiceName}Service`].fetchSchema(this.space.name).do((rawSchema) => {

            if (this.type === 'profile' && this.properties) {
                // console.log(this.properties);
                this.profileService.findSpaceLinks(this.properties, this.space);
            } else if (this.type.includes('rain')) {

                // debugger;
                // console.log(this.schema);

                this.properties = this.rainService.rain.filter(rain => rain.rainType === this.type)[0].properties;
            }
        }).subscribe();
    }

    ngOnDestroy() {
        this.obsRx.unsubscribe();
    }

    protected linkItemToSpace(property): void {
        this.space[property.friendlyName] = objectPath.get(this.schema, property.schemaPath);
        this.linkingToSpace.emit(this.space);
    }

    protected isItemLinked(property): boolean {
        debugger;
        return this.space[property.friendlyName] === objectPath.get(this.schema, property.schemaPath);
    }
}
