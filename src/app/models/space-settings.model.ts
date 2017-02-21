
import {PropObj} from '../classes/property-object.class';

export class SpaceOauthSettings {
    constructor(public settings: Array<OauthSettings> = null,
                public extras: Array<OauthExtras> = null,
                public modified: number = null,
                public connected = false,
                public authorizationUrl?: string,
                public middlewareAuthUrl?: string,
                public redirectUrl?: string) {
    }

    private castValues(haystack, needle, replace): string {
        return haystack.replace(needle, replace);
    }

    public populateMatches(keys: Array<string>) {

        this.settings.map(params => {

            if (keys.indexOf(params.keyName) !== -1) {
                let settingsValue = params.value;
                if (settingsValue) {

                    let regex = /(\<(.*?)\>)/gm, foundKey;

                    while (foundKey = regex.exec(settingsValue)) {
                        const matches = this.settings.filter(settings => settings.keyName === foundKey[2]);

                        if (matches.length) {
                            settingsValue = this.castValues(settingsValue, foundKey[1], matches[0].value);
                        }
                    }
                    const oauthKey = keys[keys.indexOf(params.keyName)];
                    this[oauthKey] = settingsValue;
                }
            }
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

