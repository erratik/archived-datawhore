const mongoose = require('mongoose');
const colors = require('colors');
const ObjectId = require('mongodb').ObjectId;
var _ = require('lodash');

const dropSchema = new mongoose.Schema({
    type: String,
    id: Number,
    content: {}
});

let Drop;
const DropSchema = {
    schema: {
        space: String,
        drops: [dropSchema]
    },
    self: {
        findDrops: function (space, type = null, cb) {
            const query = { space: space };
            this.findOne({ space: space }, function (err, docs) {
                if (docs) {
                    docs.drops = type !== 'all' ? docs.drops.filter(d => d.type) : docs.drops;
                    cb(docs);
                }
            });
        },
        findDrop: function (space, id, cb) {

            const dropid = new ObjectId(id);
            const query = { space: space, 'drops._id': dropid };
            const subQuery = { '_id': dropid };

            this.find(query, { 'drops.$': 1 }, function (err, docs) {
                cb(docs)
            });

        },
        // removeDrop: function (space, type, cb) {
        //     var query = { space: space, 'schemas.type': type };
        //     this.update(query, { $pull: { schemas: { type: type } } }, { multi: true }, function (error, _updated) {
        //         if (_updated.ok) {
        //             cb();
        //         }
        //     });
        // },
        writeDrops: function (space, drops, type, cb) {
            const query = { space: space, 'drops.type': type };
            var that = this;
            const possibleTimeKeys = ['created_time', 'date', 'timestamp', 'time'];

            var addSchema = function (callback) {

                drops = drops.filter(drop => {
                    Object.keys(drop.content).map(key => {
                        if (possibleTimeKeys.includes(key) && typeof Number(drop.content[key]) === 'number') {

                            const timestamp = drop.content[key];
                            drop.content[key] = Number(drop.content[key]);
                            if (timestamp.length === 10) {
                                drop.content[key] = timestamp * 1000;
                                drop.id = drop.content[key];
                            }

                        }
                    });
                    if (!existingDropTimestamps.includes(drop.id)) {
                        return drop;
                    }
                });

                that.findOneAndUpdate({ space: space }, { $push: { drops: { $each: drops } } }, { upsert: true, returnNewDocument: true }, function (err, updated) {

                    that.findOne(query, (err, docs) => {
                        if (err) cb(err);
                        cb(docs.drops);
                    });
                });
            };


            let existingDropTimestamps = [];
            that.findOne(query, function (_err, _docs) {
                if (_docs) {
                    existingDropTimestamps = _docs.drops.map(drop => {
                        if (drop.id)
                            return drop.id
                    });
                }
                addSchema(cb);
            });

        }
    }
};
Drop = require('./createModel')(mongoose, 'Drop', DropSchema);
module.exports = Drop;
//# sourceMappingURL=/Users/erratik/Sites/datawhore/admin/api/models/dropModel.js.map
