module.exports = function (app) {

    require('./coreApi')(app);
    require('./connectApi')(app);

};