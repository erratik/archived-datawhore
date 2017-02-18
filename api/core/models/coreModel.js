var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    name: String,
    last_modified: Number,
    saved: Boolean,
    virgin: Number,
    networks: {}
});

var CoreSchema =  {
    updateConfig: function(configs, callback) {
        Core.updateSpace({
            configs: configs,
            last_modified: Date.now() / 1000 | 0
        }, function(err, core) {
            Core.findOne({
                name: 'core'
            }, function(err, core) {
                if (err) console.log(err);
                //console.log('Core Model > saved profile...');
                if (typeof callback == 'function') callback(core);
            });
        });
    },
    updating: function(params, callback) {


        Core.findOne({
            name: 'core'
        }, function(err, core) {
            if (err) console.log(err);

            var updatedCore = {
              configs: params.configs || core.configs,
              networks: params.networks || core.networks,
              virgin: Object.keys(core.networks).length,
              last_modified: Date.now() / 1000 | 0
            };


            Core.updateSpace(updatedCore, function(err, core) {
                Core.findOne({
                    name: 'core'
                }, function(err, core) {
                    if (err) console.log(err);
                    //console.log('Core Model > updated core...');
                    if (typeof callback == 'function') callback(core);
                });
            });

        });

    },
    getNetworkConfigs: function(params, callback){

        if (params.namespace) {
            Core.findOne('core', function(err, core) {
                if (!core) {
                    //console.log('no core found');
                } else {
                    callback(core.networks[params.namespace]); // return core in JSON format
                    
                }
            });
        } else {

            Core.find(function(err, core) {
                if (!core.length) {
                    //console.log('no core saved');
                } else {
                    // //console.log(core[0].networks)

                    callback(core[0].networks); // return core in JSON format
                }
            });
        }
            
    }
};

var Core = require('./createModel')(mongoose, 'Core', CoreSchema);
module.exports = Core;