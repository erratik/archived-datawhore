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
                const rain = res.json();
                const types =  Array.from( new Set(rain.dimensions.map(dim => dim.type) ) );

                // this.rain = [];
                types.map(type => {
                    this.rain = this.rainSchemas.map(schema => new Rain(
                            space,
                            rain.dimensions.filter(dims => {
                                if (dims.type === type) {
                                    return new RainDimension(dims.friendlyName, dims.schemaPath, dims.type)
                                }
                            }),
                            schema.type,
                            rain.modified
                        ));
                });

                return this.rain;
            })
            .catch(this.handleError);
    }

    public getDrops(space: string, queryObj = null): Observable<any> {

        queryObj = queryObj ? '?' + Object.keys(queryObj).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(queryObj[k])).join('&') : '';

        return this.http.get(`${this.apiServer}/get/drops/${space}${queryObj}`)
            .map((res: Response) => {
                const dropsResponse = res.json();
                if (!this.drops[space]) {
                    this.drops[space] = [...this.sortDrops(dropsResponse.drops, space)];
                    debugger;
                } else {
                    this.sortDrops(dropsResponse.drops, space).forEach(drop => this.drops[space].push(drop));
                    // co
                    // this.drops[space];
                    debugger;

                }

                this.drops[space] = _.sortBy(this.drops[space], (o) => {
                    debugger;
                    return Number(o['content']['date']);
                });
                return this.drops[space];
            })
            .catch(this.handleError);
    }

    public sortDrops(drops, space): any {
        return drops.map(drop => {
            // console.log(this.rain);
            const dropProperties = this.rain.filter(rain => rain.rainType === drop.type)[0].properties;

            const content = {};
            dropProperties.forEach(prop => content[prop.friendlyName] = objectPath.get(drop, prop.schemaPath));
            // debugger;
            drop = new Drop(space, drop.type, content, drop.timestamp);

            return drop;
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
