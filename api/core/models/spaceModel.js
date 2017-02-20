var mongoose = require('mongoose');
var moment = require('moment');
var _ = require('lodash');

var assignValues = require('../../utils/prioritize').assignValues;
var writeProperties = require('../../utils/prioritize').writeProperties;
var util = require('../../utils/util');

// var Profile = require('./profileModel');

// Define the model w/ pretty syntax!
/*var ConfigSchema =  {
 schema: {
 name: String,
 last_modified: Number,
 connected: Boolean,
 settings: {},
 profileConfig: {},
 postConfig: {},
 avatar: String,
 username: String
 },
 self: {
 findByName: function (name, cb) {
 return this.find({name: name}, cb);
 },
 getOauthSettings: function (name, cb) {
 // console.log(this.find({ name: name }));
 return this.find({name: name}, 'settings', cb);
 },
 getAll: function (cb) {

 return this.find({}, cb);
 }
 },
 resetConfig: function (options, cb) {

 console.log('<------- resetting ' + options.type + ' config ------->');

 var data = util.mapProperties(options.data);


 // testing
 var entities = _.filter(data, 'entity');
 console.log(':: ', entities);
 _.forEach(entities, function (entity) {
 console.log('');
 console.log(_.filter(entity.attributes, 'entity'));
 _.forEach(_.filter(entity.attributes, 'entity'), function (attribute, key) {
 console.log(attribute.label, '^', attribute.attributes);
 });
 // console.log('^',_.filter(entity.content, 'entity'));
 });


 console.log('data? ', data);


 this.updateSpaceSettings({
 data: data,
 type: options.type,
 reset: true
 }, function (config) {
 cb(config);
 });

 },

 updateSpaceSettings: function (options, cb) {

 var query = {name: this.name},
 update = {last_modified: moment().format('X')},
 opts = {multi: false, upsert: true},
 isConfig = typeof options.reset == 'boolean';
 var that = this.model('Config');
 var updateFetchedProperties = options.reset;

 // console.log('what?!', updateFetchedProperties);

 if (isConfig) {
 // I don't want the "reset" to be used yet, I'lls end it as an option or something.
 // so for now, "updateFetchedProperties (reset)" => "update fetched properties"
 update[options.type + 'Config'] = (updateFetchedProperties) ? options.data : options.data;

 } else if (options.type == 'core') {
 // console.log();
 update.settings = {};
 _.each(options.data, function (obj, key) {
 update.settings[key] = {};
 _.each(obj, function (settings, k) {
 //return settings;
 update.settings[key][settings.key] = {
 value: settings.value,
 label: settings.label
 };

 });
 });
 update.connected = true;

 } else {
 // create the settings object by map the "type",
 // which is actually a mapped object to create ('settings.oauth')
 // with the data the keys with values and labels
 // console.log(options.data);
 var data = [];
 data.push(options.data);
 var updatedObj = _.zipObjectDeep([options.type], data);
 if ('settings.oauth') update.connected = true;
 _.merge(update, updatedObj);
 }

 // console.log('-> going to update config entry with:');
 // console.log(update);
 // cb(update);

 this.model('Config').findOne({name: query.name}, function (err, currentConfig) {

 var data = writeProperties(options.data);
 /!*console.log('-------- (current raw) -----------');
 console.log(currentConfig[options.type + 'Space']);
 console.log('-------- (current truthy) -----------');
 console.log(writeProperties(currentConfig[options.type + 'Space']));*!/

 /!*var incompleteAttributes = _.filter(currentConfig[options.type + 'Space'], function(o){
 if ( _.isNil(o.content))
 return o;
 });
 console.log('-------- (current incomplete attributes) -----------');
 console.log(incompleteAttributes);*!/

 var enabledAttributes = {};
 gatherEnabled(currentConfig[options.type + 'Config'], enabledAttributes);
 function gatherEnabled(object, newObj) {

 _.filter(object, function (attribute, key) {

 if (typeof object[key].grouped == 'boolean' && !object[key].grouped && object[key].content.enabled) {
 // return attribute;
 newObj[key] = attribute;
 } else if (object[key].grouped) {
 // comments: { content: { count: [Object] }, grouped: true }
 var nestedObj = object[key]; // { content: { count: { enabled: true, value: 5, label: 'count'  }, grouped: true }
 recur(attribute.content, nestedObj.content);
 function recur(content, newNestedObj) {
 // newNestedObj => { enabled: true, value: 5, label: 'count'  }
 // console.log(content, newNestedObj);
 _.filter(content, function (childAttr, k) {
 // todo: this is super untested, haha
 // console.log(key,' is a grouped item!');
 if (!_.isNil(newNestedObj[k])) {
 // console.log('newNestedObj is', k, ' =>', newNestedObj[k]);
 newObj[key] = {content: {}, grouped: true};
 if (_.isBoolean(newNestedObj[k].grouped)) {
 // console.log(key,'=>', k, ':', childAttr);
 recur(childAttr.content, newObj[key].content);
 } else if (childAttr.enabled) {
 newObj[key].content[k] = newNestedObj[k];
 }
 }
 });
 };
 }
 });
 }


 if (_.size(data)) {

 console.log('--->  found data to enable in this update  ---------');
 console.log(data);

 } else if (_.size(enabledAttributes)) {
 console.log('---> no data to enable in this update ');

 var existingKeys = _.keys(enabledAttributes);
 var saveData = options.data;
 // console.log('---------- result if the attributes are already enabled ---------');
 var _update = _.merge(enabledAttributes, _.omit(saveData, existingKeys));
 _.forEach(_update, function (attribute, key) {
 if (_.size(attribute.content) != _.size(saveData[key].content)) {
 console.log('attribute size: ', _.size(attribute.content), ' | ', 'saveData key (' + key + ') size:', _.size(saveData[key].content));
 console.log(_.merge(attribute.content, saveData[key].content));
 }
 });
 update[options.type + 'Config'] = _update;
 data = writeProperties(_update);
 // console.log('-----------------------------');
 // console.log(_update);
 // console.log('-----------------------------');
 // console.log(data);
 // console.log('-----------------------------');
 // console.log(saveData);
 // console.log('-----------------------------');


 }

 cb({config: options.data, properties: data});

 // that.update(query, update, opts, function (err, modelUpdated) {
 //     if (modelUpdated) {
 //
 //         // check to see if this data is a config for post or profile
 //         if (isConfig) {
 //             // if it's a config, update the profile model too
 //             var _profile = new Profile({name: query.name}); // instantiated Profile
 //             _profile.update({
 //                 data: data,
 //                 type: options.type,
 //                 updateFromConfig: true
 //             }, function (err, profileSaved) {
 //                 if (profileSaved) cb({config: update[options.type + 'Space'], properties: data});
 //             });
 //         } else if (!isConfig && modelUpdated) {
 //             cb(update);
 //         } else if (err || modelUpdated) {
 //             var msg = err ? err : modelUpdated;
 //             cb(msg);
 //         }
 //     } else {
 //         cb(err);
 //     }
 // });
 });

 },
 connect: function (cb) {

 var query = {name: this.name},
 update = {
 last_modified: moment().format('X'),
 connected: false
 },
 opts = {multi: false, upsert: true};


 this.model('Config').update(query, update, opts, function (err, modelUpdated) {

 console.log('update: ', update);

 if (modelUpdated) {
 cb(update);
 } else if (err) {
 cb(err);
 }

 });

 }
 };*/


var ConfigSchema = {
    schema: {
        name: String,
        modified: Number,
        avatar: String,
        username: String,
        icon: String
    },
    self: {
        findByName: function (name, cb) {
            return this.find({name: name}, cb);
        },
        getAll: function (cb) {
            return this.find({}, cb);
        }
    },
    updateSpace: function (update, cb) {

        var query = {name: this.name},
            opts = {multi: false, upsert: true};

        update.modified = Date.now();

        this.model('Config').update(query, update, opts, function (err, modelUpdated) {

            if (modelUpdated) {
                cb(update);
            } else if (err) {
                cb(err);
            }

        });

    }
};

// Profile = mongoose.model('Profile', Profile);


var Space = require('./createModel')(mongoose, 'Config', ConfigSchema);

module.exports = Space;