const mongoose = require('mongoose');
const colors = require('colors');
const ObjectId = require('mongodb').ObjectId;
var _ = require('lodash');
var moment = require('moment');
const DROP_FETCH_PARAMS = require('../constants.class').DROP_FETCH_PARAMS;

const dropSchema = new mongoose.Schema({
    type: String,
    timestamp: Number,
    content: {}
});

let Drop;
const DropSchema = {
    schema: {
        space: String,
        drops: [dropSchema]
    },
    self: {
        findDrops: function (space, options, cb, isFetchingPast) {
            const that = this;

            const limit = options.limit ? options.limit : 5;
            const after = options.after ? options.after : Date.now();

            let query = { space: space };
            let subQuery = {};
            let objectId;

            const findDropSpace = (query, cb, cb2) => {
                that.findOne(query, function (err, docs) {

                    // docs.drops = docs.drops.length ? docs.drops.slice(0, limit) : [];
                    objectId = docs.drops[0].ownerDocument()['_id'];


                    if (!cb2) {
                        cb(prepareDrops(options, docs));
                    } else {

                        cb2(docs, cb);
                    }
                });
            }

            const prepareDrops = (options, docs) => {
                if (docs) {
                    docs.space = space;

                    docs.drops = options.type ? docs.drops.filter(d => d.type === options.type) : docs.drops;
                    docs.drops = _.sortBy(docs.drops, ['timestamp']).reverse();
                    docs.drops = docs.drops.slice(0, limit);
                } else {
                    docs = [{ drops: [] }];
                }
                return docs;
            }

            if (options.type) {
                // filtering by type
                query['drops.type'] = options.type;
                this.findOne(query, { 'drops.$': 1 }, function (err, docs) {
                    // docs = docs[0];
                    if (options.after) {
                        // query['drops.timestamp'] = { $lt: Number(options.after) };
                        findDropSpace(query, cb, (docs, cb) => {
                            that.aggregate({ $match: { _id: objectId }},
                            { $unwind: '$drops'},
                            { $match: {'drops.timestamp': { $lt: Number(options.after) }}},
                            { $group: {_id: '$_id', drops: {$push: '$drops'}}}, (err, docs) => {

                                cb(prepareDrops(options, docs[0]));
                            });
                        });

                    } else {
                        cb(prepareDrops(options, docs));
                    }

                });


            } else if (options === 'getParams') {
                this.findOne(query, function (err, docs) {
                    if (!docs) {
                        docs = [{ drops: [] }];
                    }
                    cb(DROP_FETCH_PARAMS(space, isFetchingPast, docs));
                });

            } else {

                findDropSpace(query, cb);

            }

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

            var addSchema = function (callback) {

                drops = drops.filter(drop => {

                    // this needs to be come something that can save dimensions, REAL dimensions
                    const possibleTimestampKeys = ['created_time', 'date', 'timestamp', 'time', 'created_at', 'played_at', 'createdAt'];
                    Object.keys(drop.content).map(key => {
                        if (possibleTimestampKeys.includes(key)) {

                            const dateCheck = drop.content[key].length === 13 ? drop.content[key] : moment(drop.content[key]).format('x');

                            if (typeof Number(dateCheck) === 'number') {
                                const timestamp = drop.content[key];
                                drop.content[key] = dateCheck;
                                if (timestamp.length === 10) {
                                    drop.content[key] = timestamp * 1000;
                                }
                                drop.timestamp = drop.timestamp ? Number(drop.timestamp) : Number(drop.content[key]);
                                // console.log(`timestamp for this ${space} drop is: ${drop.timestamp}`);
                            }
                        }
                    });

                    if (!existingDropTimestamps.includes(Number(drop.timestamp))) {
                        return drop;
                    }
                });

                if (drops && drops.length) {

                    that.findOneAndUpdate({ space: space }, { $push: { drops: { $each: drops } } }, { upsert: true, returnNewDocument: true }, function (err, updated) {
                        // console.log(existingDropTimestamps);
                        // cb(drops);
                        that.findOne(query, (err, docs) => {
                            if (err) cb(err);
                            console.log(space, '=>', existingDropTimestamps.length, drops.length);
                            console.log(`${drops.length} ${type} drops on ${space}`);
                            cb(drops, drops.length);
                        });
                    });
                } else {
                    cb([]);
                }
            };


            let existingDropTimestamps = [];
            that.findOne(query, function (err, spaceDrops) {
                if (spaceDrops) {
                    existingDropTimestamps = spaceDrops.drops.map(drop => {
                        if (drop.timestamp)
                            return drop.timestamp
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
