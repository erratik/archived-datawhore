import {SpaceOauthSettings} from './space-settings.model';

export class Space {
    constructor(public name: string,
                public modified: number,
                public oauth: SpaceOauthSettings = null,
                public fetchUrl: string = null,
                public inEditMode = false,
                public icon?: string,
                public username?: string,
                public description?: string,
                public avatar?: string,
                public rainSchemas?: any[],
                public dropCount?: number) {
    }

}
