import { Drop } from '../../models/drop.model';
import { DimensionSchema } from '../../models/dimension-schema.model';
import {Injectable} from '@angular/core';
import {Http, Response, RequestOptions, Headers} from '@angular/http';
import {Observable} from 'rxjs';
import {SpaceItemService} from '../../shared/services/space-item/space-item.service';
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

  public getRain(space: string): Observable<any> {
    return this.http.get(`${this.apiServer}/get/rain/${space}`)
        .map((res: Response) => {
            const rain = res.json();
            const types = _.uniq(rain.dimensions.map(dim => dim.type));
            this.rain = [];
            types.forEach((type: string, i: number) => {
                if (this.rainSchemas.filter(s => s.type === type).length) {

                    this.rain.push(new Rain(
                        space,
                        rain.dimensions.filter(dims => {
                            if (dims.type === type) {
                                return new RainDimension(dims.friendlyName, dims.schemaPath, dims.type)}
                            }
                        ),
                        type,
                        rain.modified
                    ));

                    this.rain.forEach(r => {
                        if (r.rainType === type) {
                            r.createPropertyBucket(this.rainSchemas.filter(s => s.type === type)[0].propertyBucket);
                        }
                    });
                }
            });

            this.rain = _.uniq(this.rain);
        })
        .catch(this.handleError);
  }

  public getDrops(space: string): Observable<any> {
    return this.http.get(`${this.apiServer}/get/drops/${space}`)
        .map((res: Response) => {
            const dropsResponse = res.json();
            this.drops[space] = this.sortDrops(dropsResponse.drops, space);
            return this.drops[space];
        })
        .catch(this.handleError);
  }

  public sortDrops(drops, space): any {
        return drops.map(drop => {
            // console.log(drop.type, this.rainSchemas.filter(rain => rain.type === drop.type)[0])
            const dropProperties = this.rain.filter(rain => rain.rainType === drop.type)[0].properties;

            const content = {};
            dropProperties.forEach(prop => content[prop.friendlyName] = objectPath.get(drop, prop.schemaPath));
            // debugger;
            drop = new Drop(space, drop.type, content, drop._id);

            return drop;
        });
  }

  public update(space: string, rain: any): Observable<any> {

    const bodyString = JSON.stringify({
      data: rain
    });

    const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
    const options = new RequestOptions({headers: headers}); // Create a request option

    return this.http.put(`${this.apiServer}/update/rain/${space}`, bodyString, options).map((res: Response) => {
      return res.json();
    }).catch(this.handleError);
  }

}
