import { RainFormComponent } from '../../rain-form/rain-form.component';
import { Component, OnInit, Input, Output, ViewChild, EventEmitter, OnChanges } from '@angular/core';
import { Rain, Dimension } from '../../../../models/rain.model';
import { Space } from '../../../../models/space.model';
import { SpacesService } from '../../../../services/spaces.service';
import { DimensionSchema } from '../../../../models/dimension-schema.model';
import { SpaceItemService } from '../../../../shared/services/space-item/space-item.service';
import { RainService } from '../../../../services/rain/rain.service';
import * as _ from 'lodash';

const objectPath = require('object-path');

@Component({
    selector: 'datawhore-rain-configs',
    templateUrl: './rain-configs.component.html',
    styleUrls: ['./rain-configs.component.less'],
    providers: [SpacesService]
})
export class RainConfigsComponent implements OnChanges, OnInit {

    public rainSchemas: any[] = [];
    protected rain: Rain[];
    @Input() protected newDimensions: () => {};
    @Input() protected spaceOauthSettings;
    @Input() protected space: Space;
    @ViewChild(RainFormComponent) protected rainForm: RainFormComponent;

    protected activeTab: string;
    protected activeSubTab = 'configs';
    protected isFetchingSchema = false;

    public newRainType: string;
    public newRainFetchUrl: string;

    public overrideRainName: any = {};
    public overrideSchemaPath: string;

    constructor(private spacesService: SpacesService,
        private spaceItemService: SpaceItemService,
        private rainService: RainService) {
    }

    ngOnInit() {
        const getRainSchemas$ = this.getRain()
            .switchMap(() => this.getRawRain());

        getRainSchemas$.subscribe(() => {
            this.activeTab = this.rainSchemas.length ? this.rainSchemas[0].type : this.activeTab;
            this.rainSchemas = this.spacesService.spaceRainSchemas;

            this.rainSchemas.forEach((rainSchema, i) => {
                if (this.rain[i] && rainSchema.propertyBucket) {
                    this.rain[i].createPropertyBucket(rainSchema.propertyBucket);
                }
                this.overrideRainName[rainSchema.type] = rainSchema.type;
            });
        });

    }

    ngOnChanges() {
        this.getActiveTab();
    }

    private getRain(): any {
        return this.rainService.getRain(this.space.name).do((rain) => {
            this.rain = rain.map(r => new Rain(
                this.space.name,
                r.dimensions.map(dims => new Dimension(dims.friendlyName, dims.schemaPath)),
                'drop',
                r.modified
            ));
        });
    }

    private getRawRain(): any {
        return this.spaceItemService.fetchSchema(this.space.name, 'rain').do((rain) => {
            this.spacesService.spaceRainSchemas = this.rainSchemas = rain.map(rainSchema => this.toSchema(rainSchema));
        });
    }

    protected writeRain(index: number, type: any = 'rain'): any {

        this.isFetchingSchema = true;

        const data = {
            apiEndpointUrl: this.newRainFetchUrl,
            action: 'schema.write',
            type: type,
            space: this.space.name
        }

        const schemas$ = this.spacesService.spaceEndpoint(this.space, data, this.rainSchemas[index]).do((updatedSchema) => {

            this.toSchemas(updatedSchema, type);
            this.setActiveTab(updatedSchema['type']);
        });

        schemas$.subscribe(() => {
            this.rain.forEach((r, i) => {
                if (this.rainSchemas[i]) {
                    r.createPropertyBucket(this.rainSchemas[i].propertyBucket);
                }
            });
            this.isFetchingSchema = false;
        });

    }

    protected updateRainSchema(index: number, type: string): any {

        this.isFetchingSchema = true;

        const schema = this.spacesService.spaceRainSchemas[index];
        schema.type = this.overrideRainName[type] !== schema.type ? this.overrideRainName[type] : schema.type;

        if (this.overrideSchemaPath) {
            schema.content = objectPath.get(this.spacesService.spaceRainSchemas[index], `content.${this.overrideSchemaPath}`);
        }
        debugger;
        const profileSchema$ = this.rainService.updateSchema(this.space.name, schema, type).do((updatedSchema) => {
            this.toSchemas(updatedSchema, type);
        });

        profileSchema$.subscribe(() => {
            this.isFetchingSchema = false;
            this.rainSchemas = this.spacesService.spaceRainSchemas;
            this.setActiveTab(schema.type);
        });
    }

    private toSchemas(updatedSchema: any, overrideRainName: string): void {
        if (_.some(this.spacesService.spaceRainSchemas, {type: updatedSchema.type})) {

            this.spacesService.spaceRainSchemas = this.spacesService.spaceRainSchemas.map(s => {
                if (s.type === updatedSchema.type) {
                    delete this.overrideRainName[overrideRainName];
                    return this.toSchema(updatedSchema);
                }
            });
        } else {
            this.spacesService.spaceRainSchemas.push(this.toSchema(updatedSchema));
        }
        this.overrideRainName[updatedSchema.type] = updatedSchema.type;
    }

    private toSchema(preSchema): DimensionSchema {
        this.overrideRainName[preSchema.type] = preSchema.type;
        this.overrideSchemaPath = null;

        return new DimensionSchema(
            preSchema.type,
            preSchema.content,
            preSchema.modified,
            preSchema.fetchUrl,
            preSchema._id
        );
    }

    public removeSchema(type: string): void {
        this.spaceItemService.removeSchema(this.space.name, type).subscribe(() => {
            this.spacesService.spaceRainSchemas = this.rainSchemas = this.rainSchemas.filter(s => {

                if (s.type !== type) {
                    return s;
                } else {
                    delete this.overrideRainName[s.type];
                }
            });

            this.getActiveTab();
        });
    }

    public setActiveTab(tabName: string): void {
        this.activeTab = tabName;
        this.activeSubTab = '';
    }

    protected getActiveTab(): any {
        return this.activeTab = this.rainSchemas.length ? this.rainSchemas[0].type : 'new-schema';
    }
}
