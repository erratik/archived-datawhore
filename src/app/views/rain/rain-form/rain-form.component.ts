import {RainService} from '../../../services/rain/rain.service';
const objectPath = require('object-path');

import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {DimensionFormComponent} from '../../../shared/component/dimensions/dimensions-form/dimensions-form.component';
import {ProfileService} from '../../../services/profile/profile.service';
import {DimensionSchema} from '../../../models/dimension-schema.model';

@Component({
    selector: 'datawhore-rain-form',
    templateUrl: './rain-form.component.html',
    styleUrls: ['./rain-form.component.less']
})
export class RainFormComponent extends DimensionFormComponent implements OnInit {

    @Input() public isFetchingSchema;
    @Input() public rainSchemaIndex;
    @Output() onRainSchema = new EventEmitter<any>();
    protected schemaObjectOverride: string = null;
    private schema;


    constructor(profileService: ProfileService,
                rainService: RainService) {
        super(profileService, rainService);
    }

    ngOnInit() {
        this.schema = this.model;
        this.model = this.model.propertyBucket;
        // this.dimSubType = this.dimType.includes('.') ? this.dimType : this.dimType.split('.')[0];
        console.log(this.dimType);
    }

    protected saveRain(index): void {
        debugger;
        this.saveDimensions(this.model, index);
    }

    protected saveRawRain(): any {

        const schema = objectPath.get(this.schema, `content.${this.schemaObjectOverride}`);
        const profileSchema$ = this.rainService.updateSchema(this.space.name, schema).do((rainSchema) => {
            this.onRainSchema.emit(new DimensionSchema(rainSchema['type'], rainSchema['content'], rainSchema.modified));
        });

        profileSchema$.subscribe(() => {
            this.isFetchingSchema = false;
        });
    }

}

