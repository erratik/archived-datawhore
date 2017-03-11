

module.exports = function (app) {

    require('./facebook.strategy')(app);
    require('./instagram.strategy')(app);
    require('./moves.strategy')(app);
    require('./tumblr.strategy')(app);
    require('./twitter.strategy')(app);
    require('./swarm.strategy')(app);
    require('./spotify.strategy')(app);

};