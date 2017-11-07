import { SpacesService } from '../../../services/spaces.service';
import { RainService } from '../../../services/rain/rain.service';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DimensionFormComponent } from '../../../shared/component/dimensions/dimensions-form/dimensions-form.component';
import { ProfileService } from '../../../services/profile/profile.service';
import { DimensionSchema } from '../../../models/dimension-schema.model';
const objectPath = require('object-path');


@Component({
    selector: 'datawhore-rain-form',
    templateUrl: './rain-form.component.html',
    styleUrls: ['./rain-form.component.less']
})
export class RainFormComponent extends DimensionFormComponent implements OnInit {

    @Input() public isFetchingSchema;
    @Input() public rainSchemaIndex;
    public model;
    @Output() onRainSchema = new EventEmitter<any>();

    constructor(spacesService: SpacesService,
        rainService: RainService) {
        super(null, rainService, spacesService)
    }

    ngOnInit() {
        const rainSchema = this.rainService.rainSchemas[this.rainSchemaIndex];
        const rain = this.rainService.rain[this.space.name].filter(({ rainType }) => rainType === this.dimType)[0];

        rainSchema.propertyBucket = rainSchema.assignValues(rain.properties);

        this.model = rainSchema.propertyBucket;

        console.log(rainSchema);

    }

    protected saveRain(index): void {
        this.saveDimensions(this.model, index);
    }

}

