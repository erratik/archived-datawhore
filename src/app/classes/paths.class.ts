
export class Paths {
    public static readonly DATAWHORE_API_URL = 'http://datawhore.erratik.ca:10010/api';
    public static readonly DATAWHORE_API_CALLBACK_URL = 'http://datawhore.erratik.ca:4200/connect';
    public static readonly SPACE_API_URL = {
        twitter: 'api.twitter.com',
        instagram: 'api.instagram.com',
        swarm: 'api.foursquare.com',
        spotify: 'api.spotify.com',
        facebook: 'graph.facebook.com',
        tumblr: 'api.tumblr.com',
        moves: 'api.moves-app.com/api/1.1'
    };
    public static readonly PROFILE_FETCH_URL = {
        twitter: '/1.1/users/show.json?screen_name=erratiktart&include_entities=false',
        instagram: '/v1/users/self/',
        spotify: '/v1/me',
        facebook: '/me?fields=about,cover,id,updated_time,picture,friends',
        tumblr: '/v2/user/info',
        swarm: '/v2/users/self',
        moves: '/user/profile'
    };
}
