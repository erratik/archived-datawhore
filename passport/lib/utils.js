
let Setting = require('../models/settingModel');

let endpoints = require('../routes/endpoints');

module.exports = {
    savePassport: function (settings, extras, profile, done) {


        endpoints.schema.write(settings.space, profile, 'profile', function(schema) {
            // console.log('connect profile saving', schema);
            settings.extras  = Object.keys(extras).map(key => {
                return {
                    'type': 'oauth',
                    'value': extras[key],
                    'label': key === 'token' ? 'accessToken' : key
                };
            });

            // console.log('saving passport', settings);
            Setting.updateSettings(settings, function (settings) {
                    done(null, settings);
                }
            );
        });

    }
};

function Extras(type, value, label) {
    this.type = type;
    this.value = value;
    this.label = label;
}