import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Paths } from 'app/classes/paths.class';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Injectable()
export class StoryService {

  private apiServer = Paths.DATAWHORE_API_URL;

  constructor(private http: Http, private router: Router) {
  }

  public getStory(options: any): Observable<any> {

    options = Object.keys(options).reduce(function (a, k) { a.push(k + '=' + encodeURIComponent(moment(options[k]).format('YYYYMMDD'))); return a; }, []).join('&');

    return this.http.get(`${this.apiServer}/get/story?${options}`)
      .map((res: Response) => res.json())
      .catch(this.handleError);
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
