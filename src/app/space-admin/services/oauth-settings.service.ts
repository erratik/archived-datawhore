import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs';
import {Space} from '../../shared/models/space.model';
import {SpaceOauthSettings, OauthSettings, OauthExtras} from '../../shared/models/space-settings.model';
import {Paths} from '../../shared/classes/paths.class';

@Injectable()
export class OauthSettingsService {

    // private instance variable to hold base url
    private apiServer = Paths.DATAWHORE_API_URL;

    constructor(private http: Http) {
    }

    public getOauthSettings(spaceName: string): Observable<SpaceOauthSettings> {
        return this.http.get(`${this.apiServer}/get/settings/${spaceName}`)
            .map((res: Response) => this.toSpaceSettings(res))
            .catch(this.handleError);
    }

    public updateSpaceSettings(space: Space): Observable<any> {

        const bodyString = JSON.stringify({data: space});
        const headers = new Headers({'Content-Type': 'application/json'});
        const options = new RequestOptions({headers: headers});

        return this.http.put(`${this.apiServer}/update/settings/${space['name']}`, bodyString, options)
            .map((res: Response) => this.toSpaceSettings(res))
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    private toSpaceSettings(res: Response): any {

        let settingsRes = res.json();
        let spaceOauth = [];
        let extras = [];

        if (settingsRes.oauth) {
            spaceOauth = settingsRes.oauth.map(settings => new OauthSettings(settings.label, settings.value, settings.keyName));
            extras = settingsRes.extras.filter(extra => extra.type === 'oauth').map(settings => new OauthExtras(settings.label, settings.value));
        }

        settingsRes = new SpaceOauthSettings(
            spaceOauth,
            extras,
            settingsRes.modified
        );

        // console.log(settingsRes);
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
