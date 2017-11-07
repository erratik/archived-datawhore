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
                const types = _.groupBy(rainResponse.dimensions, 'type');

                this.rain[space] = Object.keys(types).map(rainType => new Rain(
                    space,
                    types[rainType].map((dims: RainDimension) => new RainDimension(dims.friendlyName, dims.schemaPath, dims.type, dims['_id'])).filter(({ type }) => rainType === type),
                    rainType,
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
                let dropsResponse = res.json();

                dropsResponse = dropsResponse.map(drop => {
                    drop.space = space;
                    return drop;
                });
                if (!rainService.drops[space]) {

                    rainService.drops[space] = [];
                }
                rainService.drops[space] = rainService.drops[space].concat(rainService.enrichDrops(dropsResponse));

                return rainService.drops[space];
            })
            .catch(this.handleError);
    }

    public getCloudDrops(queryObj = null): Observable<any> {
        queryObj = queryObj ? '?' + Object.keys(queryObj).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(queryObj[k])).join('&') : '';
        const rainService = this;
        return this.http.get(`${this.apiServer}/get/drops/all${queryObj}`)
            .map((res: Response) => {
                const resp = res.json();
                resp.forEach(space => {
                    space.drops = space.drops.map(drop => {
                        drop.space = space._id;
                        return drop;
                    });
                });
                return resp;
            })
            .catch(this.handleError);
    }

    public enrichDrops(drops = null): Drop[] {
        // if (!drops) {
        //     drops = this.drops[space];
        // }

        return drops.map((drop: Drop) => {
            const content = {};

            const dropProperties = this.rain[drop.space].filter(({rainType}) => rainType === drop.type)[0].properties;
            // console.log(dropProperties);
            // debugger;

            dropProperties.forEach(({ friendlyName, schemaPath }) => {
                content[friendlyName] = objectPath.get(drop, schemaPath);
            });
            return new Drop(drop['_id'], drop.space, drop.type, content, drop.timestamp);
        });

    }


    public deleteDrops(drops: [Drop], space): any {


        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({
            headers: headers,
            body: drops.map(drop => drop.id),
        }); // Create a request option

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
