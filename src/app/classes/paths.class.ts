
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
        instagram: '/v1/media/1288049001589880167_737033',
        tumblr: '/v2/blog/erratik.tumblr.com/posts?limit=1',
        twitter: '/1.1/statuses/user_timeline.json?screen_name=erratiktart&count=1&include_rts=true',
        swarm: '/v2/users/self/checkins?limit=1',
        moves: '/user/activities/daily/20170306'
    };
}
