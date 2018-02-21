
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

        this.toDefaults({
            'apiUrl': 'API Fetch URL',
            'apiKey': 'Consumer key',
            'apiSecret': 'Consumer secret'
        });
        this.populateMatches();
    }

    private castValues(haystack, needle, replace): string {
        return haystack.replace(needle, replace);
    }

    private toDefaults(options: ISpaceSettings = null): any {

        this.configured = false;
        let extrasKeys = this.settings.map(s => s.keyName);

        for (const [keyName, label] of Object.entries(options)) {
            this.pushNewSetting(extrasKeys, keyName, label);
        }

    }

    public addLegacySettings(isRemoving: boolean, options: ILegacySettings = { 'middlewareAuthUrl': 'Middleware URL' }): any {
        let extrasKeys = this.settings.map(s => s.keyName);

        for (const [keyName, label] of Object.entries(options)) {
            if (isRemoving) {
                const idx = extrasKeys.indexOf(keyName);
                this.settings.splice(idx, 1);
                return;
            }
            this.pushNewSetting(extrasKeys, keyName, label);
        }
    }

    private pushNewSetting(extrasKeys, keyName, label): void {
        if (!extrasKeys.includes(keyName)) {
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
    apiUrl?: string;
    apiKey?: string;
    apiSecret?: string;
}

interface ILegacySettings {
    middlewareAuthUrl?: string;
}
