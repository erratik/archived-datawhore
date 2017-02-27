import {Injectable} from '@angular/core';
import {Http, Response, RequestOptions, Headers} from '@angular/http';
import {Observable} from 'rxjs';
import {Space} from '../../models/space.model';
import {SpaceItemService} from '../../shared/services/space-item/space-item.service';

@Injectable()
export class ProfileService extends SpaceItemService {

    public type = 'profile';

    constructor(http: Http) {
        super(http);
    }

    public getProfile(space: Space): Observable<any> {

        const url = `${this.apiServer}/space/profile`;
        const bodyString = JSON.stringify({
            action: 'profile.get',
            type: 'profile',
            space: space.name
        });

        const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
        const options = new RequestOptions({headers: headers}); // Create a request option

        return this.http.post(url, bodyString, options).map((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

    public fetchRaw(space: Space): Observable<any> {

        const url = `${this.apiServer}/space/schemas`;
        const bodyString = JSON.stringify({
            action: 'schemas.get',
            type: 'profile',
            space: space.name
        });

        const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
        const options = new RequestOptions({headers: headers}); // Create a request option

        return this.http.post(url, bodyString, options).map((res: Response) => {
            return res.json();
        }).catch(this.handleError);
    }

}
