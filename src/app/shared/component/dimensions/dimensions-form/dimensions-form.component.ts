import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {SpacesService} from '../../../../services/spaces.service';
import {Space} from '../../../../models/space.model';
import {Dimension} from '../../../../models/profile.model';

@Component({
    selector: 'datawhore-dim-form',
    templateUrl: './dimensions-form.component.html',
    styleUrls: ['./dimensions-form.component.less']
})
export class DimensionFormComponent implements OnInit {

    private initialModel: string;
    public dims: Array<Dimension> = [];
    @Input() protected space: Space;
    @Input() protected model: any;
    @Input() protected dimType: string;
    @Output() onNewDimensions = new EventEmitter<any>();

    constructor(private spacesService: SpacesService) {
    }

    ngOnInit() {
        this.initialModel = JSON.stringify(this.model);
    }

    protected haveDimsChanged(): boolean {
        return JSON.stringify(this.model) !== this.initialModel;
    }

    protected saveDimensions(): any {

        this.dims = [];

        const data = {
            action: this.dimType + '.write',
            type: this.dimType,
            space: this.space.name,
            content: this.prepareDimensions()
        };

        const profileSchema$ = this.spacesService.spaceEndpoint(this.space, data).do((dims) => {
            console.log(dims);
            this.dims = dims.map(dim => new Dimension(dim.friendlyName, dim.schemaPath));
            this.onNewDimensions.emit([this.dims, this.dimType]);
        });

        profileSchema$.subscribe(() => {
            // console.log(this.profileSchema.propertyBucket);
            // this.model = this.profileSchema.propertyBucket;
        });

    }

    private prepareDimensions(): any {

        const groupEnabled = (dimensions) => {
            dimensions.forEach(dim => {
                if (dim) {
                    if (dim.grouped) {
                        groupEnabled(dim.content.value);
                    } else if (dim.content.enabled) {
                        this.dims.push(dim.content);
                    }
                }
            });
            return this.dims;
        };

        return groupEnabled(this.model).map(dims => {
            return {
                friendlyName: dims.friendlyName,
                schemaPath: dims.schemaPath
            };
        });

    }


}
