
let Setting = require('../models/settingModel');
let endpoints = require('../routes/endpoints');

module.exports = {
    savePassport: function (space, settings, extras, profile, done) {


        endpoints.schema.write(space, profile, 'profile', function(schema) {
            console.log('connect profile saving', profile);

            settings.extras  = Object.keys(extras).map(key => {
                return {
                    'type': 'oauth',
                    'value': extras[key],
                    'label': key === 'token' ? 'accessToken' : key
                };
            });

            console.log('saving passport', settings);
            Setting.updateSettings(settings, function (settings) {
                    done(null, settings);
                }
            );
        });

    },
    pluck: (key, array) => {
        const plucked = array.filter(arr => {
            const _key = arr.keyName ? arr.keyName : arr.label;
            if (_key === key) {
                return arr.value;
            }
        })[0];
        return plucked.value;
    }
};

function Extras(type, value, label) {
    this.type = type;
    this.value = value;
    this.label = label;
}
