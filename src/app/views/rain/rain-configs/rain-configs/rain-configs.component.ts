import { RainFormComponent } from '../../rain-form/rain-form.component';
import { Component, OnInit, Input, Output, ViewChild, EventEmitter, OnChanges } from '@angular/core';
import { Rain, Dimension } from '../../../../models/rain.model';
import { Space } from '../../../../models/space.model';
import { SpacesService } from '../../../../services/spaces.service';
import { DimensionSchema } from '../../../../models/dimension-schema.model';
import { SpaceItemService } from '../../../../shared/services/space-item/space-item.service';
import { RainService } from '../../../../services/rain/rain.service';
const objectPath = require('object-path');

@Component({
    selector: 'datawhore-rain-configs',
    templateUrl: './rain-configs.component.html',
    styleUrls: ['./rain-configs.component.less'],
    providers: [SpacesService]
})
export class RainConfigsComponent implements OnChanges, OnInit {

    public rainSchemas: Array<any> = [];
    protected rain: Array<Rain>;
    @Input() protected newDimensions: () => {};
    @Input() protected spaceOauthSettings;
    @Input() protected space: Space;
    @ViewChild(RainFormComponent) protected rainForm: RainFormComponent;

    protected activeTab;
    protected activeSubTab = 'configs';
    protected isFetchingSchema = false;

    protected newRainType: string;
    protected schemaObjectOverride: string = null;
    private rainFetchUrl = null;

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

    protected writeRain(index: number, type: any = 'rain', override = false): any {

        if (this.rainSchemas.length) {
            this.rainFetchUrl = this.rainSchemas.filter(s => s.type === type)[0].fetchUrl;
        }

        if (!this.rainFetchUrl) {
            console.error(`there is no profile getter path for ${this.space.name}`);
            return;
        }

        this.isFetchingSchema = true;

        // start with spaceOauthSettings values, for most /api/space/endpoint usages
        const data = Object.assign(this.spaceOauthSettings);
        data['apiEndpointUrl'] = typeof type === 'object' ? type.fetchUrl : this.rainFetchUrl;
        data['action'] = 'schema.write';
        data['type'] = typeof type === 'object' ? type.typeName : type;
        data['space'] = this.space.name;
        data['override'] = override;

        const schemas$ = this.spacesService.spaceEndpoint(this.space, data, this.rainSchemas[index]).do((updatedSchema) => {
            this.toSchemas(updatedSchema);
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

    protected saveRawRain(index: number, type: string): any {

        this.isFetchingSchema = true;
        let schema = objectPath.get(this.spacesService.spaceRainSchemas[index], `content.${this.schemaObjectOverride}`);
        this.spacesService.spaceRainSchemas[index].content = schema;

        if (!schema) {
            schema = this.spacesService.spaceRainSchemas[index];
        }

        // todo: remove this silly param call, we don't need the schema AND the spacesService schema (topSchema)
        const profileSchema$ = this.rainService.updateSchema(this.space.name, schema, type, this.spacesService.spaceRainSchemas[index]).do((updatedSchema) => {
            this.toSchemas(updatedSchema);
            this.rainForm.model = this.spacesService.spaceRainSchemas[index].propertyBucket;
        });

        profileSchema$.subscribe(() => {
            this.isFetchingSchema = false;
        });
    }

    private toSchemas(updatedSchema: any): void {
        if (this.spacesService.spaceRainSchemas.length) {
            this.spacesService.spaceRainSchemas = this.spacesService.spaceRainSchemas.map(s => {
                if (s.type === updatedSchema.type) {
                    return this.toSchema(updatedSchema);
                }
            });
        } else {
            this.spacesService.spaceRainSchemas.push(this.toSchema(updatedSchema));
        }
    }

    private toSchema(preSchema): DimensionSchema {
        return new DimensionSchema(
            preSchema.type,
            preSchema.content,
            preSchema.modified,
            preSchema.fetchUrl
        );
    }

    public removeSchema(type: string): void {
        this.spaceItemService.removeSchema(this.space.name, type).subscribe(() => {
            this.spacesService.spaceRainSchemas = this.rainSchemas = this.rainSchemas.filter(s => s.type !== type);
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
