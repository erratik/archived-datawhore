
import {Component, Input, EventEmitter, Output} from '@angular/core';
import {Space} from '../../../../models/space.model';
import {Dimension} from '../../../../models/profile.model';
import { Rain, RainDimension } from '../../../../models/rain.model';
import {ProfileService} from '../../../../services/profile.service';
import {RainService} from '../../../../services/rain.service';
import {SpacesService} from '../../../../services/spaces.service';
import * as _ from 'lodash';

@Component({
    selector: 'datawhore-dim-form',
    templateUrl: './dimensions-form.component.html',
    styleUrls: ['./dimensions-form.component.less']
})
export class DimensionFormComponent {

    public initialModel: string;
    public dims: Dimension[] = []; // temp
    public rain: Rain[];
    @Input() public space: Space;
    @Input() public model: any;
    @Input() public dimType: string;
    @Output() public onNewDimensions = new EventEmitter<any>();

    constructor(public profileService?: ProfileService,
                public rainService?: RainService,
                public spacesService?: SpacesService) {
                this.rain  = this.rainService.rain.filter(({rainType}) => rainType ===  this.rainService.type);
    }

    public haveDimsChanged(): boolean {
        return JSON.stringify(this.model) !== this.initialModel;
    }

    public saveDimensions(propertyBucket = this.model, dimArrayIndex = null): any {

        this.dims = [];
        const dimSubType = this.rainService.type;
        this.dimType = this.dimType.includes('.') ? this.dimType.split('.')[0] : this.dimType;

                debugger;
        const dimensions$ = this[`${this.dimType}Service`].update(this.space.name, this.prepareDimensions(dimSubType), propertyBucket).do((dims) => {
            if (this.dimType === 'rain') {
                this.dims = dims.map(dim => new RainDimension(dim.friendlyName, dim.schemaPath, dim.type, dims._id));
            } else {
                this.dims = dims.map(dim => new Dimension(dim.friendlyName, dim.schemaPath, dim.type));
            }
            // this[`${this.dimType}Service`].dimensions = this.dims;
            this[`${this.dimType}Service`].dimensions = _.merge(this[`${this.dimType}Service`].dimensions, this.dims);
            this.onNewDimensions.emit([this.dims, this.dimType, dimArrayIndex]);
        });

        dimensions$.subscribe();

    }

    private prepareDimensions(type, propertyBucket = this.model): any {
        const groupEnabled = (dimensions) => {

            const groupDimensions = (dim) => {
                if (dim.grouped) {
                    if (dim.content.enabled) {
                        this.dims.push(dim.content);
                    }
                    groupEnabled(dim.content.value);
                } else if (dim.content.enabled) {
                    this.dims.push(dim.content);
                }
            };

            dimensions = dimensions.propertyBucket ? dimensions.propertyBucket : dimensions;

            dimensions.forEach(dim => {
                if (dim) {
                    groupDimensions(dim);
                }
            });
            return this.dims;
        };
        return groupEnabled(propertyBucket).map(dims => {
        debugger;
            return {
                friendlyName: dims.friendlyName,
                schemaPath: dims.schemaPath,
                type: type,
                id: dims['id']
            };
        });

    }


}
