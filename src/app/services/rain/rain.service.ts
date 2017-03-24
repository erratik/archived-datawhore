import {Injectable} from '@angular/core';
import {Http, Response, RequestOptions, Headers} from '@angular/http';
import {Observable} from 'rxjs';
import {SpaceItemService} from '../../shared/services/space-item/space-item.service';
import { Rain, RainDimension } from '../../models/rain.model';

import * as _ from 'lodash';

@Injectable()
export class RainService extends SpaceItemService {

  public type = 'rain';
  public dimensions = {};
  public rain: Rain[] = [];
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
