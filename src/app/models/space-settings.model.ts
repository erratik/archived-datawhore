
import {PropObj} from '../classes/property-object.class';

export class SpaceOauthSettings {
    constructor(public settings: Array<OauthSettings> = null,
                public extras: Array<OauthExtras> = null,
                public modified: number = null,
                public connected = false,
                public authorizationUrl?: string,
                public middlewareAuthUrl?: string,
                public redirectUrl?: string) {

        this.settings.filter(prop => {
            if (prop.keyName === 'authorizationUrl') { this.authorizationUrl = prop.value; }
            if (prop.keyName === 'middlewareAuthUrl') { this.middlewareAuthUrl = prop.value; }
        });
    }

    public populateMatches(value, oauth) {

        let matchedSettings;
        let regex = /(\<(.*?)\>)/gm, match;
        while (match = regex.exec(oauth[value])) {
            const settingsArr = oauth.settings.filter(settings => settings.keyName === match[2]);

            matchedSettings = settingsArr.map(setting => setting.castValues(oauth[value], match[1], settingsArr[0].value));
            if (matchedSettings.length) {
                return matchedSettings[0];
            }
        }
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

