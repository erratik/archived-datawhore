import {Injectable} from '@angular/core';
import {Paths} from '../../classes/paths.class';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Space} from '../../models/space.model';
import {Observable} from 'rxjs';
import {SpaceOauthSettings, OauthSettings, OauthExtras} from '../../models/space-settings.model';

@Injectable()
export class OauthSettingsService {

  // private instance variable to hold base url
  private apiServer = Paths.DATAWHORE_API_URL;

  constructor(private http: Http) {
  }

  // oauth services

  public requestAccessToken(space: Space, isOauth2 = false, oauth2): Observable<Space> {
    let queryData = '', urlSplit = [];

    if ( space.oauth.middlewareAuthUrl) {
      urlSplit = space.oauth.middlewareAuthUrl.split('?');
      queryData = JSON.parse('{"' + decodeURI(urlSplit[1].replace(/&/g, '\",\"').replace(/=/g, '\":\"')) + '"}');
    } else {
      urlSplit[0] = '';
    }

      const bodyString = JSON.stringify({url: urlSplit[0], data: queryData, oauth2: oauth2}); // Stringify payload

    const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
    const options = new RequestOptions({headers: headers}); // Create a request option

    return this.http.post(`${this.apiServer}/oauth/middleware`, bodyString, options)
        .map((res) => {
          let resExtras = space.oauth.extras;
          if (!isOauth2) {
            const oauthExtras: Array<OauthExtras> = [];
            resExtras = res.json();
            for (const key of Object.keys(resExtras)) {
              oauthExtras.push(new OauthExtras(key, resExtras[key]));
            }
            space.oauth.extras = oauthExtras;
          } else {
            space.oauth.extras.push(new OauthExtras('accessToken', JSON.parse(res['_body'])));
          }


          return space;
        })
        .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  public getOauthSettings(spaceName: string): Observable<SpaceOauthSettings> {
    return this.http.get(`${this.apiServer}/space/settings/${spaceName}`)
        .map((res: Response) => {
          return this.setupSpaceSettings(res);
        })
        .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  public updateSpaceSettings(space: Space): Observable<any> {

    const bodyString = JSON.stringify(space);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});

    return this.http.put(`${this.apiServer}/space/update/settings/${space['name']}`, bodyString, options)
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
      const extras = settingsRes.extras.filter(extra => extra.type === 'oauth');
      settingsRes = new SpaceOauthSettings(
          spaceOauth.map(settings => new OauthSettings(settings.label, settings.value, settings.keyName)),
          extras.map(settings => new OauthExtras(settings.label, settings.value)),
          modified
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
