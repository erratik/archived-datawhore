import {Injectable} from '@angular/core';
import {Paths} from '../../../classes/paths.class';
import {Http, Response, RequestOptions, Headers} from '@angular/http';
import {Observable} from 'rxjs';
import {Space} from '../../../models/space.model';

@Injectable()
export class SpaceItemService {

    public apiServer: string = Paths.DATAWHORE_API_URL;
    public type: string = null;

    constructor(public http: Http) {
    }

    public fetchSchema(space: string, schemaType = this.type): Observable<any> {
        return this.http.get(`${this.apiServer}/get/schema/${space}?type=${schemaType}`).map((res: Response) => res.json())
            .catch(this.handleError);
    }

    public updateSchema(space: string, schema: any, type = this.type, topSchema = null): Observable<any> {
        const payload = {
            data: schema,
            type: type
        };
        // debugger;
        if (topSchema) {
            payload['topSchema'] = topSchema;
        }

        const bodyString = JSON.stringify(payload);

        const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
        const options = new RequestOptions({headers: headers}); // Create a request option

        return this.http.put(`${this.apiServer}/update/schema/${space}`, bodyString, options).map((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    public removeSchema(space: string, schemaType = this.type): any {
        return this.http.delete(`${this.apiServer}/schema/${space}/${schemaType}/`)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    public handleError(error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json().message || error.json();
            const err = body.error || JSON.stringify(body);
            errMsg = `[${error.status}] ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
