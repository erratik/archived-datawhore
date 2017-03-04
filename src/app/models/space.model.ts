import {SpaceOauthSettings} from './space-settings.model';

export class Space {
    constructor(public name: string,
                public modified: number,
                public oauth: SpaceOauthSettings = null,
                public inEditMode = false,
                public icon?: string,
                public avatar?: string) {
    }

}
