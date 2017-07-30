const mongoose = require('mongoose');

const ObjectId = require('mongodb').ObjectId;
var _ = require('lodash');
var moment = require('moment');
const FetchingService = require('../services/fetch-params.service');

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
                    if (docs) {
                        objectId = docs.drops[0].ownerDocument()['_id'];
                    } else {

                        var drop = new Drop({
                            space: space,
                            drops: [{
                                type: ''
                            }]
                        });
                        docs = {drops: [drop]};

                    }


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
                    cb(FetchingService.compose(space, isFetchingPast, docs));
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

            let dateFormat = null;
            switch (space) {
                case 'swarm':
                case 'instagram':
                    dateFormat = 'X';
                    break;
                case 'twitter':
                    dateFormat = 'ddd MMM DD hh:mm:ss Z YYYY';
                    break;
                case 'spotify':
                case 'dribbble':
                    dateFormat = moment.defaultFormat;
                    break;
                case 'tumblr':
                    dateFormat = 'YYYY-MM-DD hh:mm:ss GMT';
                    break;
                case 'facebook':
                case 'moves':
                    dateFormat = moment.ISO_8601 + 'Z';
                    break;
                default:


            }

            var addSchema = function (callback) {

                drops = drops.filter((drop, i) => {

                    // this needs to be come something that can save dimensions, REAL dimensions
                    const possibleTimestampKeys = ['created_time', 'date', 'timestamp', 'time', 'created_at', 'played_at', 'createdAt', 'startTime', 'endTime'];

                    Object.keys(drop.content).map(key => {
                        if (possibleTimestampKeys.includes(key)) {
                            drop.timestamp = dateFormat ? moment(drop.content[key], dateFormat).format('x') : moment.unix(drop.content[key]).format('X');
                            drop.timestamp = (key !== 'timestamp') ? Number(drop.timestamp) : Number(moment(drop.content[key], 'X').format('x'));
                        }
                    });

                    if (!existingDropTimestamps.includes(Number(drop.timestamp))) {
                        return drop;
                    }
                });

                if (drops.length > 0) {

                    that.findOneAndUpdate({ space: space }, { $push: { drops: { $each: drops } } }, { upsert: true, returnNewDocument: true }, function (err, updated) {
                        if (updated) {
                            const lastDrop = _.max(updated.drops, function(o) { return o.timestamp; });
                            const lastDropAdded = _.min(drops, function(o) { return o.timestamp; });
                            // console.log(lastDropAdded);
                            if (!!lastDropAdded) {
                                console.log(space, '=>', lastDrop.timestamp, lastDropAdded.timestamp);
                                query['drops.timestamp'] =  { $gt: lastDrop.timestamp};
                                that.findOne(query, { 'drops.$': 1 } , (err, docs) => {
                                    if (err) cb(err);
                                    if (docs) {
                                        console.log(lastDropAdded);

                                        console.log('[dropModel] ', space, '=>', docs.drops.length);
                                        console.log(`[dropModel] ${drops.length} ${type} drops on ${space}`);

                                        cb(docs.drops, docs.drops.length);
                                    }
                                });
                            }

                        } else {
                                    cb([], 0);

                        }
                    });
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
