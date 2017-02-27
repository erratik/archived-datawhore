import {SpaceOauthSettings, OauthSettings} from './space-settings.model';
import {Paths} from '../classes/paths.class';

export class Space {
    constructor(public name: string,
                public modified: number,
                public oauth: SpaceOauthSettings = null,
                public inEditMode = false,
                public icon?: string,
                public avatar?: string) {
    }

    private fillDefaultOauthSettings(params): void {
        this.oauth.settings = [];

        const defaultOauthValues = {
            'apiKey': 'Consumer key',
            'apiSecret': 'Consumer secret',
            'authorizationUrl': 'Authorization URL',
            'middlewareAuthUrl': 'Middleware URL',
            'redirectUrl': 'Redirect URL'
        };

        for (let [keyName, label] of Object.entries(defaultOauthValues)) {
            const value = keyName === 'redirectUrl' ? `${Paths.DATAWHORE_API_CALLBACK_URL}/${this.name}/` : '';
            this.oauth.settings.push(new OauthSettings(label, value, keyName));
        }

    }

    public toSpaceSettings(options: Options): any {

        if (!this.oauth.settings.length) { // the spaceName has been configured
            this.fillDefaultOauthSettings(options);
        }

        // use the modified date from settings, not from spaceName
        this.modified = this.oauth.modified;

        return this;
    }

}

interface Options {
    modified?: number;
    inEditMode?: boolean;
    name?: string;
    icon?: string;
    oauth?: SpaceOauthSettings;
    // aMethod?: (a: string) => string;
}
