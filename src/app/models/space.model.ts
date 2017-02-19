
import {SpaceOauthSettings, OauthSettings} from './space-settings.model';
export class SpaceModel {
    constructor(public name: string,
                public modified: number,
                public oauth: SpaceOauthSettings = null,
                public inEditMode = false,
                public connected = false,
                public avatar?: string,
                public icon?: string) {
    }

    public makeSpaceModel(options: Options): any {


        // checking to find an object, which means we have settings, maybe this should return false if no setting?
        // making sure we have an auth url and middelware url close by, not useful yet
        this.oauth = typeof this.oauth === 'string' ? null : this.oauth;

        // the space has been configured, so add the auth url... (premature)
        if (this.oauth.settings) { // the space has been configured
            // todo: figure out how to make this happen in the SpaceOauthSettings, not in here, it's confusing
            this.oauth.settings.filter(prop => {
                if (prop.keyName === 'authorizationUrl') { this.oauth.authorizationUrl = prop.value; }
                if (prop.keyName === 'middlewareAuthUrl') { this.oauth.middlewareAuthUrl = prop.value; }
            });
            // console.log(`! default/minimal oauth settings are already set for ${options.name}`);
        } else {
            // here, we should also check and see what needs to be added to a new space model?
            // console.log(`? no auth settings filled for ${options.name}, find out what fields need to be filled?`);

            this.fillDefaultSettings();

        }
        // console.log(this.oauth);
        // console.log('> ', new Date (this.oauth.modified));
        // console.log(options.modified);
        // console.log(this.oauth.modified);

        // use the modified date from settings, not from space
        this.modified = this.oauth.modified;


        // console.log(this);

        return this;
    }


    public fillDefaultSettings(): void {
        // build the default settings here
        this.oauth.settings = [];
        // this.modified = Date.now();
        // console.log(this.oauth); // "first", "one"

        const defaultOauthValues = {
            'apiKey': 'Consumer key',
            'apiSecret': 'Consumer secret',
            'authorizationUrl': 'Authorization URL'
        };

        for (let [key, value] of Object.entries(defaultOauthValues)) {
            // console.log(key, value); // "first", "one"
            this.oauth.settings.push(new OauthSettings(value, '', key));
        }

    }

}

interface Options {
    modified?: number;
    inEditMode?: boolean;
    name?: string;
    oauth?: SpaceOauthSettings;
    aMethod?: (a: string) => string;
}
