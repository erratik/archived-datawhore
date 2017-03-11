
let Setting = require('../models/settingModel');

module.exports = {
    savePassport: function (settings, token, tokenSecret, profile, done) {
        settings.extras = [
            {
                'type': 'oauth',
                'value': tokenSecret,
                'label': 'tokenSecret'
            },
            {
                'type': 'oauth',
                'value': token,
                'label': 'accessToken'
            }
        ];

        console.log('saving passport', settings);
        Setting.updateSettings(settings, function (settings) {
                done(null, settings);
            }
        );
    }
};