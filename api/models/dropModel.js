const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Long = mongoose.Schema.Types.Long;
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
    getSpaceId: (spaceName) => {
        this.find({ space: spaceName}, function (err, docs) {
            if (err) cb(err);
            return docs;
        });
    },
    self: {
        getSpaceDrops: function (params, cb) {
        
            const that = this;
            
            that.findOne({ space: params.space}, function (err, result) {
                if (err) cb(err);
                if (result) {

                    const dropDocId = result._id;
                    // debugger;
                    let dropQuery = {}, limit;
                    if (!!params.query && !!params.query.after) {
                        dropQuery = {'drops.timestamp': { $lt: Number(params.query.after) }};
                    }
                    
                    let aggregation = {
                        base: [
                            { $match: { space: params.space, "_id": dropDocId}},
                            { $unwind: "$drops" },
                            { $match: dropQuery},
                            { $sort: { 'drops.timestamp': -1 }},
                            { $project: {_id: '$_id', drops: '$drops', type: '$drops.type'} },
                            { $group: {_id: '$type', count: {'$sum': 1}, drops: {$push: '$drops'}}}
                        ],
                        getType: [
                            { $group: {
                                    _id: '$_id', 
                                    aggregatedDrops: {$addToSet: '$drops'}
                                }
                            },
                            { $match: { '_id': params.type} }
                        ],
                        getAll: [
                            { $group: {
                                    _id: params.space, 
                                    types: {$push: {type: '$_id', count: '$count', drops: '$drops'}}
                                }
                            }
                        ]
                    };

                    if (!!params.query && !!params.query.limit) {
                        aggregation.base.splice(4, 0, { $limit: Number(params.query.limit)} );
                    }

                    const options = !!params.type ? aggregation.getType : aggregation.getAll;
                    const query = aggregation.base.concat(options);

                    that.aggregate(query).exec(function (err, docs) {
                        if (err) cb(err);
                        if (!!docs) {
                            let drops;
                            if (docs.length && docs[0].aggregatedDrops[0].length) {
                                drops = docs[0].aggregatedDrops[0];
                            } else {
                                console.log('empty aggregate query result for: ', query)
                                drops = [];
                            }
                            cb(drops);
                        }
                    });
                } else {
                    cb([]);
                }

            });
            
        },
        // findDropSpace: (query, cb, cb2) => {
        //     this.model('drops').findOne(query, function (err, docs) {

        //         // docs.drops = docs.drops.length ? docs.drops.slice(0, limit) : [];
        //         if (docs) {
        //             objectId = docs.drops[0].ownerDocument()['_id'];
        //         } else {

        //             var drop = new Drop({
        //                 space: space,
        //                 drops: [{
        //                     type: ''
        //                 }]
        //             });
        //             docs = {drops: [drop]};

        //         }


        //         if (!cb2) {
        //             cb(prepareDrops(options, docs));
        //         } else {

        //             cb2(docs, cb);
        //         }
        //     });
        // },
        // prepareDrops: (options, docs) => {
        //     if (docs) {
        //         docs.space = space;

        //         docs.drops = options.type ? docs.drops.filter(d => d.type === options.type) : docs.drops;
        //         docs.drops = _.sortBy(docs.drops, ['timestamp']).reverse();
        //         docs.drops = docs.drops.slice(0, limit);
        //     } else {
        //         docs = [{ drops: [] }];
        //     }
        //     return docs;
        // },
        // findDrops: function (space, options, cb, isFetchingPast) {
        //     const that = this;

        //     const limit = options.limit ? options.limit : 5;
        //     const after = options.after ? options.after : Date.now();

        //     let query = { space: space };
        //     let subQuery = {};
        //     let objectId;

            

        //     if (options.type) {
        //         // filtering by type
        //         query['drops.type'] = options.type;
        //         this.findOne(query, { 'drops.$': 1 }, function (err, docs) {
        //             // docs = docs[0];
        //             if (options.after) {
        //                 // query['drops.timestamp'] = { $lt: Number(options.after) };
        //                 findDropSpace(query, cb, (docs, cb) => {
        //                     that.aggregate({ $match: { _id: objectId }},
        //                     { $unwind: '$drops'},
        //                     { $match: {'drops.timestamp': { $lt: Number(options.after) }}},
        //                     { $group: {_id: '$_id', drops: {$push: '$drops'}}}, (err, docs) => {

        //                         cb(prepareDrops(options, docs[0]));
        //                     });
        //                 });

        //             } else {
        //                 cb(prepareDrops(options, docs));
        //             }

        //         });


        //     } else {

        //         findDropSpace(query, cb);

        //     }

        // },
        // fetchParams: function (options, isFetchingPast, cb) {

        //     // this.findOne(query, function (err, docs) {
        //     //     if (!docs) {
        //     //         docs = [{ drops: [] }];
        //     //     }
        //     //     return FetchingService.compose(query., isFetchingPast, docs);
        //     // });

        //     // this.findDropSpace(options, cb, (docs, cb) => {
        //         // this.aggregate({ $match: { type: options.type }},
        //         // { $unwind: '$drops'},
        //         // { $match: {'drops.timestamp': { $lt: Number(options.after) }}},
        //         // { $group: {_id: '$_id', drops: {$push: '$drops'}}}, (err, docs) => {

        //         //     cb(prepareDrops(options, docs[0]));
        //         // });

        //         this.aggregate({ $match: { space: options.space }},
        //         { $unwind: '$drops'},
        //         { $match: {'drops.timestamp': { $lt: Date.now() }, 'drops.type': options.type  }},
        //         { $group: {_id: '$_id', drops: {$push: '$drops'}}}, (err, docs) => {
        //             if (err) cb(err);
        //             const drops = !!docs[0] ? docs[0].drops : [];
        //             console.log(`[fetchParams] ${drops.length} ${options.type} drops in ${options.space}`);
        //             cb(drops);
        //         });
        //     // });

        // },
        findAll: function (options, cb) {
            
            const query = options;

            this.find(query,function (err, docs) {
                if (err) cb(err);
                cb(docs[0]);
            });
        },
        countByTypes: function (spaceName, cb) {
            this.aggregate(
                { $match: { space: spaceName }},
                { $unwind: "$drops" },
                { $unwind: "$drops.type" },
                { $project: {_id: '$_id', type: '$drops.type'} },
                { $group: {_id: '$type', count: {'$sum': 1}}},
                { $group: {
                        _id: spaceName, 
                        types: {$push: {type: '$_id', count: '$count'}}
                    }
                }, (err, docs) => {
                    const types = docs.length ? docs[0].types : [];
                    cb(types);
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
        removeDrops: function (space, dropIds, cb) {
            var query = { space: space};
            const drops = dropIds.map(drop => ObjectId(drop));
            this.update(query, { $pull: { 'drops': {$in: drops}  } }, { multi: true }, function (error, _updated) {
                if (_updated.ok) {
                    cb('');
                }
            });
        },
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
                case 'moves':
                    dateFormat = 'YYYYMMDD';
                    break;
                case 'facebook':
                
                    dateFormat = moment.ISO_8601 + 'Z';
                    break;
                default:


            }
            var addSchema = function (callback) {

                drops = drops.map((drop, i) => {

                    // this needs to be come something that can save dimensions, REAL dimensions
                    const possibleTimestampKeys = ['created_time', 'date', 'timestamp', 'time', 'created_at', 'played_at', 'createdAt', 'startTime', 'endTime'];

                    Object.keys(drop.content).map(key => {
                        if (possibleTimestampKeys.includes(key)) {
                            drop.timestamp = dateFormat ? moment(drop.content[key], dateFormat).format('x') : moment.unix(drop.content[key]).format('X');
                            drop.timestamp = (key !== 'timestamp') ? Number(drop.timestamp) : Number(moment(drop.content[key], 'X').format('x'));
                            // )new Timestamp(
                        }
                    });

                    return drop;

                }).filter(drop => {
                    return !existingDropTimestamps.includes(Number(drop.timestamp));
                });

                if (drops.length) {

                            that.findOneAndUpdate(
                                {space: space}, 
                                { $addToSet: { drops: { $each: drops } }  }, 
                                { upsert: true, returnNewDocument: true }, 
                                function (err, updated) {
                                
                                
                                if (!!updated) {
                                    const lastDrop = _.max(_.filter(updated.drops, {type}), function(o) { return o.timestamp; });
                                    const lastDropAdded = _.min(_.filter(drops, {type}), function(o) { return o.timestamp; });
                                    if (!!lastDropAdded) {
                                        console.log(`[dropModel] 💧 ${drops.length} | ${type} added on ${space} `);
                                        cb(updated.drops, lastDropAdded, drops.length);
                                    }

                                } else {
                                    cb([], null, 0);
                                }
                            });
                            
                }

            };



            let existingDropTimestamps = [];
            that.findOne(query, function (err, spaceDrops) {
                if (!!spaceDrops) {
                    existingDropTimestamps = spaceDrops.drops.map(drop => {
                        if (drop.timestamp && drop.type === type )
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
