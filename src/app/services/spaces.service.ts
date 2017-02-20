import {SpaceModel} from '../models/space.model';
import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs';
import {SpaceOauthSettings, OauthSettings, OauthExtras} from '../models/space-settings.model';
import {Paths} from '../classes/paths.class';

@Injectable()
export class SpacesService {

    // private instance variable to hold base url
    private apiServer = Paths.DATAWHORE_API_URL;

    constructor(private http: Http) {
    }

    getSpace(spaceName: string): Observable<SpaceModel> {
        return this.http.get(`${this.apiServer}/space/${spaceName}`).map((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }


    public getAllSpaces(): Observable<SpaceModel[]> {
        return this.http.get(`${this.apiServer}/spaces`).map((res: Response) => {

            const spaces = res.json();
            return spaces.map(space => {
                return new SpaceModel(
                    space.name,
                    space.modified,
                    null, false, space.icon
                );

            });
        }).catch(this.handleError);
    }

    public getOauthSettings(spaceName: string): Observable<SpaceOauthSettings> {
        return this.http.get(`${this.apiServer}/space/settings/${spaceName}`)
            .map((res: Response) => {
                return this.setupSpaceSettings(res);
            })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
/*
    public connect(space: SpaceModel, authorizationUrl: string): any {
        console.log(space.name, authorizationUrl);

        // fill up the placeholders by casting the actual key values
        //
        // });
        // return this.http.post(`${authorizationUrl}`)
        //     .map((res: Response) => {
        //         console.log(res.json());
        //         return res.json();
        //     })
        //     .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }*/

    public requestAccessToken(url: string, space: SpaceModel): Observable<SpaceModel> {

        const urlSplit = url.split('?');
        const queryData = JSON.parse('{"' + decodeURI(urlSplit[1].replace(/&/g, '\",\"').replace(/=/g, '\":\"')) + '"}');

        const bodyString = JSON.stringify({url: url, data: queryData}); // Stringify payload
        const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
        const options = new RequestOptions({headers: headers}); // Create a request option

        return this.http.post(`${this.apiServer}/oauth/middleware`, bodyString, options)
            .map((res) => {
                const oauthExtras: Array<OauthExtras> = [];
                const resExtras = res.json();
                for (let key of Object.keys(resExtras)) {
                    oauthExtras.push(new OauthExtras(key, resExtras[key]));
                }

                space.oauth.connected = !resExtras.hasOwnProperty('error');
                space.oauth.extras = oauthExtras;

                return space;
            })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }


    public updateSpace(space: SpaceModel): Observable<any> {

        const bodyString = JSON.stringify(space);
        const headers = new Headers({'Content-Type': 'application/json'});
        const options = new RequestOptions({headers: headers});

        return this.http.put(`${this.apiServer}/space/update/${space['name']}`, bodyString, options)
            .map((res: Response) => {
                return this.setupSpaceSettings(res);
            })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    private setupSpaceSettings(res: Response): any {

        let settingsRes = res.json();

        if (settingsRes.oauth) {
            const spaceOauth = settingsRes.oauth;
            const modified = settingsRes.modified;
            const connected = settingsRes.connected;

            let extras = settingsRes.extras.filter(extra => extra.type === 'oauth');
            settingsRes = new SpaceOauthSettings(
                spaceOauth.map(settings => new OauthSettings(settings.label, settings.value, settings.keyName)),
                extras.map(settings => new OauthExtras(settings.label, settings.value)),
                modified,
                connected
            );


        } else {
            settingsRes = new SpaceOauthSettings();
        }
        return settingsRes;
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
