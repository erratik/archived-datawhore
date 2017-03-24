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

    public getProfile(space: string): Observable<any> {
        return this.http.get(`${this.apiServer}/get/profile/${space}`)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    public update(space: string, profile: any): Observable<any> {
        const bodyString = JSON.stringify({
            data: profile
        });

        const headers = new Headers({'Content-Type': 'application/json'}); // ... Set content type to JSON
        const options = new RequestOptions({headers: headers}); // Create a request option

        return this.http.put(`${this.apiServer}/update/profile/${space}`, bodyString, options)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    public findSpaceLinks(properties, space): void {
        const spaceKeys = Object.keys(space);
        properties.forEach(property => property.linkableToSpace = spaceKeys.includes(property.friendlyName));
    }

}
