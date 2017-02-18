import {SpaceModel} from '../models/space.model';
import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs';
import {SpaceOauthSettings, OauthSettings, OauthExtras} from '../models/space-settings.model';

@Injectable()
export class SpacesService {

    private static readonly API_SERVER = 'http://127.0.0.1:10010/api';

    // private instance variable to hold base url
    private apiServer = 'http://127.0.0.1:10010/api';

    constructor(private http: Http) {
    }
/*

    getSpace(spaceName: string): Observable<SpaceModel[]> {
        console.log(spaceName);
        return this.http.get(`${this.apiServer}/space/${spaceName}`).map((res: Response) => {

            console.log('hello');
            const spaces = res.json();
            console.log(spaces);
            return spaces.map(space => {
                return new SpaceModel(space.name, space.modified);

            });
        }).catch(this.handleError);
    }

    public getSpaces(spaces, fetchSettings = false): any {
        console.log(spaces);
        spaces.forEach(space => {

            this.getSpace(space);
        });
        // return spaces.map(space => {
        //     return this.getSpace(space.name);
        //     // return new SpaceModel(space.name, space.modified);
        // }).catch(this.handleError);
    }

*/

    public getAllSpaces(fetchSettings = false): Observable<SpaceModel[]> {
        return this.http.get(`${this.apiServer}/spaces`).map((res: Response) => {

            const spaces = res.json();
            return spaces.map(space => {
                return new SpaceModel(space.name, space.modified);

            });
        }).catch(this.handleError);
    }

    public getOauthSettings(spaceName: string): Observable<SpaceOauthSettings> {
        return this.http.get(`${this.apiServer}/space/settings/${spaceName}`)
            .map((res: Response) => {
                return this.setupSpace(res);
            })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    /* public getSpace(spaceName: string, fetchSettings = false): Observable<SpaceModel> {
     return this.http.get(`${this.apiServer}/space/${spaceName}`).map((res: Response) => {

     const space = res.json();
     return space.map(spaceResponse => {
     let _space = new SpaceModel(spaceResponse.name, spaceResponse.modified || Date.now());
     return _space as SpaceModel;

     });

     })
     .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
     }*/


    public updateSpace(space: SpaceModel): Observable<any> {
        const bodyString = JSON.stringify(space); // Stringify payload
        const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
        const options = new RequestOptions({headers: headers}); // Create a request option

        return this.http.put(`${this.apiServer}/space/update/${space['name']}`, bodyString, options) // ...using put request
            .map((res: Response) => {
                return this.setupSpace(res);
            })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error')); // ...errors if any
    }

    private setupSpace(res: Response): any {
        let spaceResponse = res.json();

        if (spaceResponse.oauth) {
            const spaceOauth = spaceResponse.oauth;
            const spaceModified = spaceResponse.modified;

            let extras = spaceResponse.extras.filter(extra => extra.type === 'oauth');
            spaceResponse = new SpaceOauthSettings(
                spaceOauth.map(settings => new OauthSettings(settings.label, settings.value, settings.keyName)),
                extras.map(settings => new OauthExtras(settings.label, settings.value)),
                spaceModified
            );
        } else {
            spaceResponse = new SpaceOauthSettings();
        }
        return spaceResponse;
    }

    private extractData(res: Response) {
        let body = res.json();
        return body.data || {};
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
