
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
    public static readonly DROP_FETCH_URL = {
        spotify: '/v1/me/player/recently-played?limit=1',
        instagram: '/v1/media/1288049001589880167_737033'
    };
}
