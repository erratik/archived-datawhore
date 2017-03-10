import {Space} from '../models/space.model';
import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs';
import {Paths} from '../classes/paths.class';
import {Router} from '@angular/router';

@Injectable()
export class SpacesService {

    // private instance variable to hold base url
    private apiServer = Paths.DATAWHORE_API_URL;

    constructor(private http: Http, private router: Router) {
    }

    public getSpace(spaceName: string): Observable<Space> {
        return this.http.get(`${this.apiServer}/space/${spaceName}`).map((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    public removeSpace(spaceName: string): any {
        return this.http.delete(`${this.apiServer}/space/${spaceName}`).map((res: Response) => {
           if (res.status === 200) {
               this.router.navigate([`/spaces`]);
           }
        }).catch(this.handleError);
    }

    public getAllSpaces(): Observable<Space[]> {
        return this.http.get(`${this.apiServer}/spaces`).map((res: Response) => {

            const spaces = res.json();
            return spaces.map(space => {
                return new Space(
                    space.name,
                    space.modified,
                    null,
                    false,
                    space.icon,
                    space.username,
                    space.description,
                    space.avatar
                );

            });
        }).catch(this.handleError);
    }

    public updateSpace(space: Space): Observable<any> {

        const url = `${this.apiServer}/update/space/${space.name}`;
        const bodyString = JSON.stringify({
            space: space.name,
            data: space
        });

        const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
        const options = new RequestOptions({headers: headers}); // Create a request option

        return this.http.put(url, bodyString, options).map((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    public spaceEndpoint(space: Space, queryData, endpointPath = ''): Observable<any> {

        endpointPath = (endpointPath === '') ? 'endpoint/space' : endpointPath;
        const url = `${this.apiServer}/${endpointPath}`;
        const bodyString = JSON.stringify({
            data: queryData,
            space: space.name
        });

        const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
        const options = new RequestOptions({headers: headers}); // Create a request option

        return this.http.post(url, bodyString, options).map((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    private handleError(error: Response | any) {
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
