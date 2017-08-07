import { Drop } from '../../models/drop.model';
import { DimensionSchema } from '../../models/dimension-schema.model';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs';
import { SpaceItemService } from '../../shared/services/space-item/space-item.service';
import { Rain, RainDimension } from '../../models/rain.model';
const objectPath = require('object-path');
import * as _ from 'lodash';

@Injectable()
export class RainService extends SpaceItemService {

    public type = 'rain';
    public dimensions = {};
    public rain: Rain[] = [];
    public drops: any = {};
    public rainSchemas: any[] = [];

    constructor(http: Http) {
        super(http);
    }

    public getRain(space: string): Observable<Rain[]> {
        return this.http.get(`${this.apiServer}/get/rain/${space}`)
            .map((res: Response) => {
                const rainResponse = res.json();
                const types =  _.groupBy(rainResponse.dimensions, 'type');
                this.rain = this.rainSchemas.map(schema => new Rain(
                    space,
                    types[schema.type].map((dims: RainDimension) => new RainDimension(dims.friendlyName, dims.schemaPath, dims.type)).filter(({type}) => schema.type === type),
                    schema.type,
                    rainResponse.modified
                ));
                return this.rain;
            })
            .catch(this.handleError);
    }

    public getDrops(space: string, queryObj = null): Observable<any> {
        queryObj = queryObj ? '?' + Object.keys(queryObj).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(queryObj[k])).join('&') : '';
        const rainService = this;
        return this.http.get(`${this.apiServer}/get/drops/${space}${queryObj}`)
            .map((res: Response) => {
                const dropsResponse = res.json();
                if (!rainService.drops[space]) {
                    rainService.drops[space] = [];
                }
                rainService.drops[space] = rainService.drops[space].concat(rainService.sortDrops(space, rainService.type, dropsResponse.drops));
                return rainService.drops[space];
            })
            .catch(this.handleError);
    }

    public sortDrops(space, type, drops = null): any {
        if (!drops) {
            drops = this.drops[space];
        }
        return drops.map(drop => {
            const content = {};
            const dropProperties = this.rain.filter(rain => rain.rainType === type)[0].properties;
            dropProperties.forEach(prop => content[prop.friendlyName] = objectPath.get(drop, prop.schemaPath));

            return new Drop(space, drop.type, content, drop.timestamp);
        });

    }

    public update(space: string, rain: any): Observable<any> {

        const bodyString = JSON.stringify({
            data: rain
        });

        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option

        return this.http.put(`${this.apiServer}/update/rain/${space}`, bodyString, options).map((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

}
