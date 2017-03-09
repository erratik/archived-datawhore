
import {PropObj} from '../classes/property-object.class';
import {Paths} from '../classes/paths.class';

export class SpaceOauthSettings {
    constructor(public settings: Array<OauthSettings> = null,
                public extras: Array<OauthExtras> = null,
                public modified: number,
                public connected = false,
                public configured = true,
                public authorizationUrl?: string,
                public middlewareAuthUrl?: string,
                public redirectUrl?: string) {

        this.connected = this.extras.length > 0 && this.extras.filter(extra => extra.label === 'accessToken').length > 0;
        if (!this.settings.length) {
            this.toDefaults();
        }
    }

    private castValues(haystack, needle, replace): string {
        return haystack.replace(needle, replace);
    }

    private toDefaults(space: any = false): void {
        this.settings = [];
        this.configured = false;

        const defaultOauthValues = {
            'apiKey': 'Consumer key',
            'apiSecret': 'Consumer secret',
            'authorizationUrl': 'Authorization URL',
            'middlewareAuthUrl': 'Middleware URL',
            'redirectUrl': 'Redirect URL'
        };

        for (const [keyName, label] of Object.entries(defaultOauthValues)) {
            const value = keyName === 'redirectUrl' && space ? `${Paths.DATAWHORE_API_CALLBACK_URL}/${space}/` : '';
            this.settings.push(new OauthSettings(label, value, keyName));
        }

    }

    private populateMatches(): void {
        this.settings.map((params, index) => {

                let settingsValue = params.value;
                if (settingsValue) {

                    const regex = /(\<(.*?)\>)/gm;
                    let foundKey = null;
                    while (foundKey = regex.exec(settingsValue)) {
                        const matches = this.settings.filter(settings => settings.keyName === foundKey[2]);
                        if (matches.length) {
                            settingsValue = this.castValues(settingsValue, foundKey[1], matches[0].value);
                        }
                    }

                    this.settings[index].value = settingsValue;
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

/*

interface DefaultSpaceSettings {
    settings: Array<OauthSettings>;
    extras: Array<OauthExtras>;
    modified: number;
    connected: boolean;
    authorizationUrl?: string;
    middlewareAuthUrl?: string;
    redirectUrl?: string;
}
*/
