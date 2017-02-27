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
        findProfile: function (spaceName: string, schemaType: string, cb) {
            this.find({space: spaceName},
                function (err, docs) {
                    if (docs) {
                        cb(docs[0]);
                    }
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
                    console.log('updated profile -> ', updated);
                    cb(updated);
                });
        }
    }

};

const Profile = require('./createModel')(mongoose, 'Profile', ProfileSchema);

module.exports = Profile;
