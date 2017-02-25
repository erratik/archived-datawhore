
export class Paths {
    public static readonly DATAWHORE_API_URL = 'http://datawhore.erratik.ca:10010/api';
    public static readonly DATAWHORE_API_CALLBACK_URL = 'http://datawhore.erratik.ca:4200/connect';
    public static readonly SPACE_API_URL = {
        twitter: 'api.twitter.com',
        tumblr: 'api.tumblr.com'
    };
    public static readonly PROFILE_FETCH_URL = {
        twitter: '/1.1/users/show.json?screen_name=erratiktart&include_entities=false',
        tumblr: '/v2/blog/erratik.tumblr.com/info'
    };
}
