
import { PropObj } from '../classes/property-object.class';
import { Paths } from '../classes/paths.class';

export class SpaceOauthSettings {
    constructor(
        public settings: Array<OauthSettings> = null,
        public extras: Array<OauthExtras> = null,
        public modified: number,
        public connected = false,
        public configured = true,
        public authorizationUrl?: string,
        public middlewareAuthUrl?: string,
        public redirectUrl?: string) {

        this.connected = this.extras.length > 0 && this.extras.filter(extra => extra.label === 'accessToken').length > 0;
        if (!this.settings.length) {
            this.toDefaults({
                'apiKey': 'Consumer key',
                'apiSecret': 'Consumer secret'
            });
        }
        this.populateMatches();
    }

    private castValues(haystack, needle, replace): string {
        return haystack.replace(needle, replace);
    }

    private toDefaults(options: ISpaceSettings = null): void {
        this.settings = [];
        this.configured = false;

        const defaultOauthValues = {
            'apiKey': 'Consumer key',
            'apiSecret': 'Consumer secret'
        };

        // 'authorizationUrl': 'Authorization URL',
        // 'middlewareAuthUrl': 'Middleware URL',
        // 'redirectUrl': 'Redirect URL'
        for (const [keyName, label] of Object.entries(options)) {
            this.settings.push(new OauthSettings(label, '', keyName));
        }

    }

    private populateMatches(): void {
        this.extras.map(params => {

            let extras = params.value;
            if (extras) {

                const regex = /(\<(.*?)\>)/gm;
                let foundKey = null;
                while (foundKey = regex.exec(extras)) {
                    const matches = this.extras.filter(x => x.label === foundKey[2]);
                    if (matches.length) {
                        extras = this.castValues(extras, foundKey[1], matches[0].value);
                    }
                }

                this[params.label] = extras;
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

interface ISpaceSettings {
    apiKey?: string;
    apiSecret?: string;
}
