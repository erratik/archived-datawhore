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

    @Input() protected newDimensions: () => {};
    @Input() protected spaceOauthSettings;
    @Input() protected space: Space;
    protected rain: Array<Rain>;
    protected schemas = [];

    public rainSchemas: Array<any> = [];
    private rainFetchUrl = null;
    protected newRainType: string;
    protected schemaObjectOverride: string = null;


    protected isFetchingSchema = false;

    protected editRainMode = false;
    protected activeTab;
    protected activeSubTab = 'configs';

    constructor(private spacesService: SpacesService,
                private spaceItemService: SpaceItemService,
                private rainService: RainService) {
    }

    ngOnInit() {

        const getRainSchemas$ = this.getRain()
            .switchMap(() => this.getRawRain());

        getRainSchemas$.subscribe(() => {
            console.log(this)
        });

    }

    ngOnChanges() {
        this.getActiveTab();
    }

    private getRain(): any {
        // debugger;
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
        // console.log(this.rain)
        this.rainFetchUrl = this.rainSchemas.filter(s => s.type === type)[0].fetchUrl;
        // debugger;
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

        const schemas$ = this.spacesService.spaceEndpoint(this.space, data).do((resetRainSchema) => {

            // if (resetRainSchema.type === data.type) {
                this.spacesService.spaceRainSchemas.map(s => {
                    if (s.type === resetRainSchema.type) {
                        debugger;
                        return new DimensionSchema(resetRainSchema['type'], resetRainSchema['content'], resetRainSchema.modified);
                    }
                });
                // this.spacesService.spaceRainSchemas.push(new DimensionSchema(resetRainSchema['type'], resetRainSchema['content'], resetRainSchema.modified));
            // }

            this.rainSchemas = this.spacesService.spaceRainSchemas;
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

        debugger;
        const profileSchema$ = this.rainService.updateSchema(this.space.name, schema, type).do((rainSchema) => {
            this.spacesService.spaceRainSchemas.map(s => {
                if (s.type === rainSchema.type) {
                    return new DimensionSchema(rainSchema['type'], rainSchema['content'], rainSchema.modified);
                }
            });
        });

        profileSchema$.subscribe(() => {
            this.isFetchingSchema = false;
        });
    }

    // protected updateRainSchema(schemaData): any {
    //     console.log(schemaData, this);
    //
    //     debugger;
    //     if (!this.rainSchemas) {
    //         this.rainSchemas = [new DimensionSchema(schemaData.type, schemaData.content, schemaData.modified)];
    //
    //     }
    //     schemaData = [schemaData];
    //     this.rainSchemas.map(s => {
    //         // debugger;
    //         if (s.type === schemaData[0].type) {
    //             s = schemaData;
    //         }
    //     });
    //     // }
    //
    // }

    public setActiveTab(tabName: string): void {
        this.activeTab = tabName;
        this.activeSubTab = '';
        console.log(this.activeTab, this.activeSubTab);
    }

    protected getActiveTab(): any {
        return this.activeTab = this.schemas.length ? this.schemas[0].type : 'new-schema';
    }
}
