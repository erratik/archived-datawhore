
import {PropObj} from '../classes/property-object.class';

export class SpaceOauthSettings {
    constructor(public settings: Array<OauthSettings> = null,
                public extras: Array<OauthExtras> = null,
                public modified: number = null,
                public connected = false,
                public authorizationUrl?: string,
                public middlewareAuthUrl?: string) {

        this.settings.filter(prop => {
            if (prop.keyName === 'authorizationUrl') { this.authorizationUrl = prop.value; }
            if (prop.keyName === 'middlewareAuthUrl') { this.middlewareAuthUrl = prop.value; }
        });
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

