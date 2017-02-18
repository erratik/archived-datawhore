var Config = require('../core/models/spaceModel');
var _ = require('lodash');

module.exports = {
    /*  MAP PROPERTIES
     *  Takes an object and recursively sets each property with:
     *  { [String propertyKey] : {grouped: Boolean, content: {data: [propertyValue], label: String, enabled: Boolean} } }
     *  @usage: this is so the properties can be gathered as enabled with another util to gather recursively truthy properties
     * ------------ ------------------------------------------------------------------------------------------------------------ */
    mapProperties: function (properties) {
        var _properties = {};
        _.forEach(properties, function (propertyObject, propertyKey) {

            _properties[propertyKey] = makeData(propertyObject, propertyKey);

        });
        return _properties;
        // console.log(_properties);
    }
};

function makeData(val, label, recursive) {
    //console.log('make data running');
    var obj = {};

    // console.log('> there are', _.size(obj.content.value), 'properties in', obj.content.label, typeof obj.content.value, _.isPlainObject(obj.content.value));

    if (_.isArray(val)) {

        obj = {
            content: {
                enabled: false,
                label: label,
                value: val
            },
            grouped: false,
            multi: true // to know if we have mutiple items, maybe something i want to store with other like values of other networks, like hashtags

        }

    } else if (_.size(val) > 1 && _.isPlainObject(val)) {

        obj = {
            attributes: {}
        };

        if (_.isNil(recursive)) {

            _.forEach(val, function (content, key) {

                // console.log('$ found a grouped object to run through again ', label);
                // console.log(label + '.' + key, 'making data....');
                if (_.isPlainObject(content)) {

                    _.forEach(content, function (attribute, k) {

                        obj.attributes[k] = makeData(attribute, k, true);
                        obj.grouped = true;
                        obj.label = label;

                    });
                }

            });

        }


    } else {
        obj = {
            content: {
                enabled: false,
                label: label,
                value: val
            },
            grouped: false
        }
    }
    // console.log('------------------------');
    // console.log(obj);

    return obj;
}
