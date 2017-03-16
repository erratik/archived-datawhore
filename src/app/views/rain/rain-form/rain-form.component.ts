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
    private schema;

    ngOnInit() {
        this.schema = this.model;
        this.model = this.model.propertyBucket;
    }

    protected saveRain(index): void {

        this.saveDimensions(this.model, index);
    }


}

