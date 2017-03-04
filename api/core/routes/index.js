module.exports = function (app) {

    require('./coreApi')(app);
    require('./connectApi')(app);
    require('./oauth1Api')(app);

};