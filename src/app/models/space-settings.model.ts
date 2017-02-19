
import {PropObj} from '../classes/property-object.class';

export class SpaceOauthSettings {
    constructor(public settings: Array<OauthSettings> = null,
                public extras: Array<OauthExtras> = null,
                public modified: number = null,
                public authorizationUrl?: string,
                public middlewareAuthUrl?: string) {
    }


}

export class OauthSettings extends PropObj {
    constructor(label: string, value: string, keyName?: string) {
        super(label, value, keyName);
    }
}


export class OauthExtras extends PropObj {
    constructor(label: string, value: string) {
        super(label, value);
    }
}

