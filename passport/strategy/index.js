

module.exports = function (app) {

    require('./twitter.strategy')(app);
    require('./spotify.strategy')(app);

};