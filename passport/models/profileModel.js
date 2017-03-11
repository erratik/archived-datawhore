var mongoose = require('mongoose');
var dimensionSchema = new mongoose.Schema({
    friendlyName: String,
    schemaPath: String
});
var ProfileSchema = {
    schema: {
        space: String,
        modified: Number,
        profile: [dimensionSchema]
    },
    self: {
        findProfile: function (spaceName, cb) {
            this.find({ space: spaceName }, function (err, docs) {
                if (!docs.length) {
                    docs = [{ space: spaceName, modified: Date.now() }];
                }
                cb(docs[0]);
            });
        },
        writeProfile: function (spaceName, profileBucket, cb) {
            var update = { modified: Date.now(), profile: profileBucket };
            this.findOneAndUpdate({ space: spaceName }, update, { upsert: true, returnNewDocument: true }, function (err, updated) {
                cb(updated);
            });
        },
        removeProfile: function (name, cb) {
            this.remove({ space: name }, cb);
        }
    }
};
var Profile = require('./createModel')(mongoose, 'Profile', ProfileSchema);
module.exports = Profile;
