import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';

import { Rain, RainDimension } from '../../../shared/models/rain.model';
import { Space } from '../../../shared/models/space.model';
import { SpacesService } from '../../../shared/services/spaces.service';
import { DimensionSchema } from '../../../shared/models/dimension-schema.model';
import { SpaceItemService } from '../../../shared/services/space-item.service';
import { RainService } from '../../../shared/services/rain.service';
import { ProfileService } from '../../../shared/services/profile.service';

import { OauthSettingsService } from '../../services/oauth-settings.service';
import { SpaceConfigComponent } from '../../component/space-config/space-config.component';

import { RainFormComponent } from '../rain-form/rain-form.component';
import { SchemaTabs } from '../../classes/constants.class';

const objectPath = require('object-path');

@Component({
    selector: 'rain-config',
    templateUrl: './rain-configs.component.html',
    styleUrls: ['./rain-configs.component.less'],
    providers: [SpacesService]
})
export class RainConfigComponent extends SpaceConfigComponent implements OnInit {

    public rainSchemas: any[] = [];
    public rain: Rain[] = [];
    @Input() public spaceOauthSettings;
    @Input() public space: Space;
    @ViewChild(RainFormComponent) public rainForm: RainFormComponent;
    public getRainSchemas$ = new Observable<any>();

    public activeSchema: string;
    public activeTab: string;
    public schemaTabs = SchemaTabs;
    public activeSchemaTab = SchemaTabs.config;

    public isFetchingSchema = false;
    public hasSchemas = false;

    public newRainType: string;
    public newRainFetchUrl: string;

    public overrideRainName: any = {};
    public overrideSchemaPath: boolean;
    public newContentPath: string;

    constructor(
        router: Router,
        spacesService: SpacesService,
        spaceItemService: SpaceItemService,
        activatedRoute: ActivatedRoute,
        rainService: RainService,
        profileService: ProfileService) {
        super(router, spacesService, spaceItemService, activatedRoute, rainService, profileService);
    }

    ngOnInit() {

        this.getRainSchemas$ = this.spaceItemService.fetchSchema(this.space.name, 'rain').do((rain) => {
            this.rainService.rainSchemas = rain.map(rainSchema => this.toSchema(rainSchema));
        })
        .switchMap(() => {
            return this.activatedRoute.params;
        })
        .do((params) => {
            this.activeTab = params['tab'];
            this.activeSchema = params['schema'];
            this.activeSchemaTab = params['subtab'];
        })
        .switchMap(() => this.getSpaceRain());

        this.getRainSchemas$.subscribe(() => {

            this.rainSchemas = this.rainService.rainSchemas;
            this.rain = this.rainService.rain;

            if (this.rainSchemas.length) {

                // TODO: yuck. so much for nothing. rethink this
                this.rainSchemas = this.rainSchemas.map(rainSchema => {
                    this.overrideRainName[rainSchema.type] = rainSchema.type;
                    return rainSchema;
                });

            } else {
                this.router.navigate(['/space', { tab: this.activeTab, schema: 'new-schema' }]);
            }
        });

    }

    public getSpaceRain(): any {
        return this.rainService.getSpaceRain(this.space.name).do((rain) => {
        });
    }


    public writeRain(index: number, type: any = 'rain'): any {

        this.isFetchingSchema = true;

        const data = {
            apiEndpointUrl: this.newRainFetchUrl || this.rainSchemas[index].fetchUrl,
            action: 'schema.write',
            type: type,
            space: this.space.name
        };

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
                preSchema.content.forEach(d => Object.keys(d).forEach(k => { merged[k] = d[k]; }));
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

    public isAddingSchema(): boolean {
        return this.activeSchema === 'new-schema' && this.activeTab === 'rain';
    }

    public subtabActive(schemaTab: SchemaTabs): boolean {
        return schemaTab === this.activeSchemaTab;
    }

    public setActiveTab(tabName: string): void {
        // this.activeSchema = this.rainService.type = tabName;
        // this.activeSchemaTab = SchemaTabs[tabName];
    }

    public getActiveTab(): any {
        const activeTab = this.rainService.rainSchemas.length ? this.rainService.rainSchemas[0].type : 'new-schema';
        return this.activeSchema = activeTab;

    }

    public getSchemaByType(): any {
        const schema = this.rainService.rain[this.space.name].filter(r => r.rainType === this.activeSchema);
        return !!schema ? schema : null;
    }

    public getRainProperties(): any {
        const [props] = this.getSchemaByType();
        return !!props ? props.properties : null;
    }

    public hasOverridePath(schema): boolean {
        return !!schema.contentPath && schema.contentPath.length;
    }
}
