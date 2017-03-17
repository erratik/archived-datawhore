import {Component, OnInit, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {Rain, Dimension} from '../../../../models/rain.model';
import {Space} from '../../../../models/space.model';
import {SpacesService} from '../../../../services/spaces.service';
import {DimensionSchema} from '../../../../models/dimension-schema.model';
import {SpaceItemService} from '../../../../shared/services/space-item/space-item.service';
import {RainService} from '../../../../services/rain/rain.service';
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
            this.spacesService.spaceRainSchemas = this.rainSchemas = rain.map(rainSchema => {
                return new DimensionSchema(
                    rainSchema.type,
                    rainSchema.content,
                    rainSchema.modified,
                    null,
                    rainSchema.fetchUrl
                );
            });
        });
    }

    protected writeRain(type: any = 'rain'): any {

        if (!this.rainFetchUrl) {
            console.error(`there is no profile getter path for ${this.space.name}`);
            return;
        }

        if (this.rainSchemas.length) {
            this.rainFetchUrl = this.rainSchemas.filter(s => s.type === type)[0].fetchUrl;
        }

        this.isFetchingSchema = true;

        // start with spaceOauthSettings values, for most /api/space/endpoint usages
        const data = Object.assign(this.spaceOauthSettings);
        data['apiEndpointUrl'] = typeof type === 'object' ? type.fetchUrl : this.rainFetchUrl;
        data['action'] = 'schema.write';
        data['type'] = typeof type === 'object' ? type.typeName : type;
        data['space'] = this.space.name;

        const schemas$ = this.spacesService.spaceEndpoint(this.space, data).do((updatedSchema) => {
            if (this.spacesService.spaceRainSchemas.length) {
                this.spacesService.spaceRainSchemas.map(s => {
                    if (s.type === updatedSchema.type) {
                        return new DimensionSchema(updatedSchema['type'], updatedSchema['content'], updatedSchema.modified);
                    }
                });
            } else {
                this.spacesService.spaceRainSchemas.push(new DimensionSchema(updatedSchema['type'], updatedSchema['content'], updatedSchema.modified));
            }
            this.setActiveTab(updatedSchema['type']);
        });

        schemas$.subscribe(() => {
            this.rain.forEach((r, i) => {
                if (this.rainSchemas[i]) {
                    r.createPropertyBucket(this.rainSchemas[i].propertyBucket);
                }
            });

            this.isFetchingSchema = false
        });

    }

    protected saveRawRain(index: number, type: string): any {

        const schema = objectPath.get(this.rainSchemas[index], `content.${this.schemaObjectOverride}`);

        const profileSchema$ = this.rainService.updateSchema(this.space.name, schema, type).do((rainSchema) => {
            this.spacesService.spaceRainSchemas = this.rainSchemas = this.spacesService.spaceRainSchemas.map(s => {
                if (s.type === rainSchema.type) {
                    return new DimensionSchema(rainSchema['type'], rainSchema['content'], rainSchema.modified);
                }
            });
        });

        profileSchema$.subscribe(() => {
            this.isFetchingSchema = false;
        });
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
        // console.log(this.activeTab, this.activeSubTab);
    }

    protected getActiveTab(): any {
        return this.activeTab = this.rainSchemas.length ? this.rainSchemas[0].type : 'new-schema';
    }
}
