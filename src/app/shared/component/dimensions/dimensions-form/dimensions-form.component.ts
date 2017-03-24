import {Component, Input, EventEmitter, Output} from '@angular/core';
import {Space} from '../../../../models/space.model';
import {Dimension} from '../../../../models/profile.model';
import {ProfileService} from '../../../../services/profile/profile.service';
import {RainService} from '../../../../services/rain/rain.service';
import {SpacesService} from '../../../../services/spaces.service';

@Component({
    selector: 'datawhore-dim-form',
    templateUrl: './dimensions-form.component.html',
    styleUrls: ['./dimensions-form.component.less']
})
export class DimensionFormComponent {

    public initialModel: string;
    public dims: Array<Dimension> = [];
    @Input() public space: Space;
    @Input() public model: any;
    @Input() public dimType: string;
    @Output() public onNewDimensions = new EventEmitter<any>();

    constructor(public profileService?: ProfileService,
                public rainService?: RainService,
                public spacesService?: SpacesService) {}

    public haveDimsChanged(): boolean {
        return JSON.stringify(this.model) !== this.initialModel;
    }

    public saveDimensions(propertyBucket = this.model, dimArrayIndex = null): any {

        this.dims = [];
        const dimSubType = this.rainService.type;
        this.dimType = this.dimType.includes('.') ? this.dimType.split('.')[0] : this.dimType;

        const dimensions$ = this[`${this.dimType}Service`].update(this.space.name, this.prepareDimensions(dimSubType), propertyBucket).do((dims) => {
            this.dims = dims.map(dim => new Dimension(dim.friendlyName, dim.schemaPath, dim.type));
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
            return {
                friendlyName: dims.friendlyName,
                schemaPath: dims.schemaPath,
                type: type
            };
        });

    }


}
