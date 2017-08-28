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
                    !!types[schema.type] ? types[schema.type].map((dims: RainDimension) => new RainDimension(dims.friendlyName, dims.schemaPath, dims.type, dims['_id'])).filter(({type}) => schema.type === type) : [],
                    schema.type,
                    rainResponse.modified
                ));
                // debugger;
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
                // debugger;
                if (!rainService.drops[space]) {
                    rainService.drops[space] = [];
                }
                rainService.drops[space] = rainService.drops[space].concat(rainService.enrichDrops(space, rainService.type, dropsResponse));
                return rainService.drops[space];
            })
            .catch(this.handleError);
    }

    private enrichDrops(space, type, drops = null): any {
        if (!drops) {
            drops = this.drops[space];
        }
        return drops.map(drop => {
            const content = {};
            const dropProperties = this.rain.filter(rain => rain.rainType === type)[0].properties;
            dropProperties.forEach(prop => content[prop.friendlyName] = objectPath.get(drop, prop.schemaPath));
            return new Drop(drop._id, space, drop.type, content, drop.timestamp);
        });

    }


    public deleteDrops(drops: [Drop], space): any {
        // const bodyString = JSON.stringify(drops.map(drop => drop.id));

        const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
        const options = new RequestOptions({
            headers: headers,
            body: drops.map(drop => drop.id),
        }); // Create a request option

        // return this.http.put(`${this.apiServer}/update/schema/${space}`).map((res: Response) => {
        return this.http.delete(`${this.apiServer}/delete/drops/${space}`, options)
            .map((res: Response) => res.json())
            .catch(this.handleError);
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
