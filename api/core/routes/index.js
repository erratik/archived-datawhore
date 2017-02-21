module.exports = function (app) {

    require('./coreApi')(app);
    require('./connectApi')(app);

    // require('./configApi')(app);
    // require('./profileApi')(app);

    // require('./api/instagramApi')(app);
    // require('./api/lastfmApi')(app);
    // require('./api/spotifyApi')(app);
    // require('./api/swarmApi')(app);
    // require('./api/tumblrApi')(app);
    // require('./api/twitterApi')(app);

};