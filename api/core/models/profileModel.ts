let mongoose = require('mongoose');

let dimensionSchema = new mongoose.Schema({
    friendlyName: String,
    schemaPath: String
});

const ProfileSchema = {
    schema: {
        space: String,
        modified: Number,
        profile: [dimensionSchema]
    },
    self: {
        findProfile: function (spaceName: string, cb) {
            const that = this;
            this.find({space: spaceName},
                function (err, docs) {
                    if (!docs.length) {
                        docs = [{space: spaceName, modified: Date.now()}];
                    }
                    cb(docs[0]);
                }
            );
        },
        writeProfile: function (spaceName: string, profileBucket: any, cb) {
            const update = {modified: Date.now(), profile: profileBucket};
            this.findOneAndUpdate(
                {space: spaceName},
                update,
                {upsert: true, returnNewDocument: true},
                function (err, updated) {
                    cb(updated);
                });
        },
        removeProfile: function (name, cb) {
            this.remove({space: name}, cb);
        },
    }

};

const Profile = require('./createModel')(mongoose, 'Profile', ProfileSchema);

module.exports = Profile;
