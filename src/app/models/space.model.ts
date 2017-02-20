
import {SpaceOauthSettings, OauthSettings} from './space-settings.model';
export class SpaceModel {
    constructor(public name: string,
                public modified: number,
                public oauth: SpaceOauthSettings = null,
                public inEditMode = false,
                public icon?: string,
                public avatar?: string) {
    }

    public toSpaceSettings(options: Options): any {
        // the spaceName has been configured, so add the auth url... (premature)

        if (!this.oauth.settings.length) { // the spaceName has been configured
            this.fillDefaultSettings();
        }

        // use the modified date from settings, not from spaceName
        this.modified = this.oauth.modified;

        return this;
    }


    public fillDefaultSettings(): void {

        this.oauth.settings = [];

        const defaultOauthValues = {
            'apiKey': 'Consumer key',
            'apiSecret': 'Consumer secret',
            'authorizationUrl': 'Authorization URL',
            'middlewareAuthUrl': 'Middleware URL',
        };

        for (let [key, value] of Object.entries(defaultOauthValues)) {
            this.oauth.settings.push(new OauthSettings(value, '', key));
        }

        // console.log(this.oauth); // "first", "one"

    }

}

interface Options {
    modified?: number;
    inEditMode?: boolean;
    name?: string;
    icon?: string;
    oauth?: SpaceOauthSettings;
    aMethod?: (a: string) => string;
}
