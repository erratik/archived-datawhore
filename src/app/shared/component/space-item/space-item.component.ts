import { pbkdf2 } from 'crypto';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Dimension } from '../../../shared/models/profile.model';
import { RainDimension } from '../../../shared/models/rain.model';
import { Space } from '../../../shared/models/space.model';
import { ProfileService } from '../../../shared/services/profile.service';
import { SpacesService } from '../../../shared/services/spaces.service';
import { RainService } from '../../../shared/services/rain.service';
import { Router, ActivatedRoute } from '@angular/router';
const objectPath = require('object-path');

@Component({
    selector: 'datawhore-space-item',
    templateUrl: './space-item.component.html',
    styleUrls: ['./space-item.component.less']
})
export class SpaceItemComponent implements OnInit {

    public rain: any;
    @Input() public schema: any;
    @Input() public properties: any[];
    @Input() public space: Space;
    @Input() public type: string;
    @Output() public linkingToSpace = new EventEmitter<Space>();
    public itemSchema$ = new Observable<any>();

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private profileService: ProfileService,
        public rainService: RainService,
        public spacesService: SpacesService) { }

    ngOnInit() {

        if (this.type === 'profile') {
            this.profileService.findSpaceLinks(this.schema.filter(sch => sch.properties), this.space);
        } else if (this.type.includes('rain')) {
            this.rain = this.rainService.rain[this.space.name].filter(r => r.rainType === this.type);
            // debugger
            this.properties = this.rain.length ? this.rain[0].properties : null;
        }
    }

    protected linkItemToSpace(property): void {
        debugger
        this.space[property.friendlyName] = objectPath.get(this.schema, property.schemaPath);
        this.linkingToSpace.emit(this.space);
    }

    protected isItemLinked(property): boolean {
        debugger;
        return this.space[property.friendlyName] === objectPath.get(this.schema, property.schemaPath);
    }

    protected getPropertyByFriendlyName(prop): any {
        this.rain = this.rainService.rain[this.space.name].filter(r => r.rainType === this.type);
        const p = this.rain.length ? this.rain[0].properties[prop.friendlyName] : null;
        debugger
    }
}
