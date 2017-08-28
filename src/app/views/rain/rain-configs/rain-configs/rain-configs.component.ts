import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RainFormComponent } from '../../rain-form/rain-form.component';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { Rain, RainDimension } from '../../../../models/rain.model';
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
    public rain: Rain[] = [];
    @Input() public newDimensions: () => {};
    @Input() public spaceOauthSettings;
    @Input() public space: Space;
    @ViewChild(RainFormComponent) public rainForm: RainFormComponent;
    public getRainSchemas$ = new Observable<any>();

    public activeTab: string;
    public activeSubTab = 'configs';
    public isFetchingSchema = false;
    public hasSchemas = false;

    public newRainType: string;
    public newRainFetchUrl: string;

    public overrideRainName: any = {};
    public overrideSchemaPath: boolean;
    public newContentPath: string;

    constructor(public spacesService: SpacesService,
        public spaceItemService: SpaceItemService,
        public activatedRoute: ActivatedRoute,
        public rainService: RainService) { }

    ngOnInit() {

        this.getRainSchemas$ = this.getRawRain()
            .switchMap(() => this.getRain());

        this.getRainSchemas$.subscribe(() => {
            this.activeTab = this.rainSchemas.length ? this.rainSchemas[0].type : this.activeTab;
            this.rainSchemas = this.rainService.rainSchemas;
            this.rain = this.rainService.rain;

            if (this.rainSchemas.length) {
                this.rainService.type = this.rainSchemas[0].type;
                this.rainService.rainSchemas = this.rainService.rainSchemas.map(rainSchema => {
                    this.overrideRainName[rainSchema.type] = rainSchema.type;
                    return rainSchema;
                });
                // console.log(this.rainSchemas);
            }
        });

    }

    ngOnChanges() {
        // this.getActiveTab();
    }

    public getRain(): any {
        // debugger;
        return this.rainService.getRain(this.space.name).do((rain) => {
            // console.log(rain);
        });
    }

    public getRawRain(): any {
        return this.spaceItemService.fetchSchema(this.space.name, 'rain').do((rain) => {
            this.rainService.rainSchemas = rain.map(rainSchema => this.toSchema(rainSchema));
            this.getActiveTab();
            this.activeSubTab = 'config';
        });
    }

    public getSchemaByType(schemaType): any {
        return this.rainSchemas.filter(({type}) => type === schemaType)[0];
    }

    public writeRain(index: number, type: any = 'rain'): any {

        this.isFetchingSchema = true;

        const data = {
            apiEndpointUrl: this.newRainFetchUrl || this.rainSchemas[index].fetchUrl,
            action: 'schema.write',
            type: type,
            space: this.space.name
        }

        const schemas$ = this.spacesService.spaceEndpoint(this.space, data, this.rainSchemas[index]).do((updatedSchema) => {

            this.toSchemas(updatedSchema, type);
            this.setActiveTab(updatedSchema['type']);
        });

        schemas$.subscribe(() => {
            this.isFetchingSchema = false;
        });

    }

    public updateRainSchema(index: number, type: string): any {

        this.isFetchingSchema = true;

        const schema = this.rainService.rainSchemas[index];
        schema.type = this.overrideRainName[type] !== schema.type ? this.overrideRainName[type] : schema.type;

        if (this.overrideSchemaPath) {
            schema.content = objectPath.get(this.rainService.rainSchemas[index], `content.${schema.newContentPath}`);
            // debugger;
        }
        const profileSchema$ = this.rainService.updateSchema(this.space.name, schema, type).do((updatedSchema) => {
            return this.toSchemas(updatedSchema, type);
        });

        profileSchema$.subscribe(updatedSchema => {
            this.isFetchingSchema = false;
            this.rainSchemas = this.rainService.rainSchemas;
            this.setActiveTab(schema.type);
        });
    }

    public toSchemas(updatedSchema: any, overrideRainName: string): void {
        if (_.some(this.rainService.rainSchemas, { type: updatedSchema.type })) {
            this.rainService.rainSchemas = this.rainService.rainSchemas.map(s => {
                if (s.type === updatedSchema.type) {
                    delete this.overrideRainName[overrideRainName];
                    return this.toSchema(updatedSchema);
                }
            });
        } else {
            this.rainService.rainSchemas.push(this.toSchema(updatedSchema));
            // debugger;
        }
        this.overrideRainName[updatedSchema.type] = updatedSchema.type;
    }

    public toSchema(preSchema): DimensionSchema {
        this.overrideRainName[preSchema.type] = preSchema.type;
        this.overrideSchemaPath = null;
        if (typeof preSchema.content === 'string') {
            preSchema.content = JSON.parse(preSchema.content);
            if (preSchema.content.length) {
                const merged = {};
                preSchema.content.forEach(d => Object.keys(d).forEach(k => {merged[k] = d[k]}));
                preSchema.content = merged;
            }
        }
        return new DimensionSchema(
            preSchema.type,
            preSchema.content,
            preSchema.modified,
            preSchema.fetchUrl,
            preSchema.dropUrl,
            preSchema.contentPath,
            preSchema._id
        );
    }

    public removeSchema(type: string): void {
        this.spaceItemService.removeSchema(this.space.name, type).subscribe(() => {
            this.rainService.rainSchemas = this.rainSchemas = this.rainSchemas.filter(s => {
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
        this.activeTab = this.rainService.type = tabName;
        this.activeSubTab = 'config';
        // debugger;
    }

    public getActiveTab(): any {
        // debugger;
        const activeTab = this.rainService.rainSchemas.length ? this.rainService.rainSchemas[0].type : 'new-schema';
        // this.activatedRoute.params['tab'] = activeTab;
        return this.activeTab = activeTab;

    }

    public getRainProperties(rainType: string): any {
        const schema = this.rainService.rain.filter(r => r.rainType === rainType)[0];
        // if (schema) {
        //     return this.rainService.rain.filter(r => r.rainType === rainType)[0].properties;
        // }
        return schema ? schema.properties : [];
    }

    public hasOverridePath(schema): boolean {
        // const schema = this.rainService.rain.filter(r => r.rainType === rainType)[0];
        // // if (schema) {
        // //     return this.rainService.rain.filter(r => r.rainType === rainType)[0].properties;
        // // }
        return !!schema.contentPath && schema.contentPath.length;
    }
}
