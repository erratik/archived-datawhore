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

    private getSpaceDimensions(space: Space): Observable<Space> {

        const url = `${this.apiServer}/dimensions`;
        const bodyString = JSON.stringify({
            type: this.type,
            space: space.name
        });

        const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
        const options = new RequestOptions({headers: headers}); // Create a request option

        return this.http.post(url, bodyString, options).map((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    public fetchSchema(space: string, type = this.type): Observable<any> {
        return this.http.get(`${this.apiServer}/get/schema/${space}?type=${type}`).map((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    public updateSchema(space: string, schema: any): Observable<any> {
        const bodyString = JSON.stringify({
            data: schema,
            type: this.type
        });

        const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
        const options = new RequestOptions({headers: headers}); // Create a request option

        return this.http.put(`${this.apiServer}/update/schema/${space}`, bodyString, options).map((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    public handleError(error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
