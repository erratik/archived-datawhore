const _ = require('lodash');
const Utils = require('./lib/utils');
const pluck = require('./lib/utils').pluck;
const URLtoObject = require('./lib/utils').URLtoObject;
const schedule = require('node-schedule');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Space = require('./models/spaceModel');
const Schema = require('./models/schemaModel');
const Drop = require('./models/dropModel');
const NamespaceService = require('./services/namespace.service');
const FetchingService = require('./services/fetch-params.service')(Drop);
const objectPath = require('object-path');

let namespaces = [];
let dropCountLastRun = 0;
let pastDropRuntimes = 0;
let dropsToFetch;


module.exports = function (app, spaces, settings, schemaGroups) {

    console.log(``);
    console.log('🔄 👄 👄 👄 ----------- CUM DUMPTRUCK RUNNING ------------- 👄 👄 👄');
    console.log(``);

    let startTime = new Date(Date.now() + 5000);
    let endTime = new Date(Date.now() + 60000 * 5);;

    let schemas = {};

    namespaces = spaces.map(space => {
        schemas[space.name] = [];
        return space.name
    });

    schemaGroups = schemaGroups.map(s => s.schemas.filter(o => {
        if (o.type.includes('rain')) {
            schemas[s.space].push(o);
            return o;
        }
    }));

    const fetchDrops = (isFetchingPast = true) => {

        dropsToFetch = 1;
        namespaces.forEach(namespace => {
            

            const types = _.uniq(_.map(schemas[namespace], 'type'));

            const dataByTypes = types.map(rainType => {

                const schema = _.filter(schemas[namespace], {
                    type: rainType
                })[0];

                if (!schema || !schema.dropUrl) {
                    console.log(`🔄 [!] no drop url set for ${rainType} on ${namespace} `);
                    endTime = Date.now();

                } else {
                    const data = {
                        action: 'drops.fetch',
                        apiEndpointUrl: schema.dropUrl,
                        contentPath: schema.contentPath,
                        type: rainType,
                        space: namespace,
                        isFetchingPast: isFetchingPast
                    }

                    return data;
                }
            });


            types.forEach((t, i) => {
                // console.log(_.filter(dataByTypes, {type: t}));
                // console.log(t, i, _.filter(dataByTypes, {type: t}));
                const isLastType = i === types.length-1;

                const thisDataFetch = _.filter(dataByTypes, {type: t})[0];
                const nextDataFetch = isLastType ? null : _.filter(dataByTypes, {type: types[i+1]})[0];
                
                initFetch(thisDataFetch, nextDataFetch);
            });
            
        });
    };

    const initFetch = (options, cbOptions) => {
        
        Drop.getSpaceDrops(options, (drops) => {
            const urlParams = FetchingService.composeParams(options, drops);
            if (options.isFetchingPast) {
                console.log('🔄 [initFetch] FETCHING PAST');
            } else {
                console.log('🔄 [initFetch] FETCHING FUTURE');
            }
            // console.log('🔄 [initFetch -> getSpaceDrops]', options.space, options.type, urlParams);
            // debugger;
            options.urlParams = urlParams;
            NamespaceService.runCall(options, (resp, lastDropAdded, countAdded) => {
                // find out if we still get results, to implement start/end
                // console.log('resp', resp, data);

                // let dropCount =  objectPath.get(resp, options.contentPath) ? objectPath.get(resp, options.contentPath).length : 0;
                let dropCount =  resp.length;

                dropCountLastRun += dropCount;

                // if (dropCountLastRun <= dropCountLastRun - dropCount) {

                //     console.log(` `);
                //     console.log('🔄 💀 💀 💀 -------------->  KILLED CUM DUMPTRUCK @ 📅 ' + new Date());
                //     console.log(` `);
                //     shiftDrops.cancel();
                //     return;
                // }


                if (!!cbOptions) {
                    // debugger;
                }
                dropCallback(options, dropCount, cbOptions);

            });
        });

    };

    
    const dropCallback = (options, dropCount, cbOptions) => {

        console.log(`🔄 [namespace service] fetching for ${options.type} on ${options.space}`);

        if (options.isFetchingPast) {

            if (pastDropRuntimes === dropsToFetch) {
                pastDropRuntimes = 0;

            } else {

                pastDropRuntimes++;
                console.log(``);
            }

        }


        messageTotal(dropCount, options.space, dropCountLastRun);
        if (cbOptions) {
            console.log(`🔄 [namespace service] running ${cbOptions.type} on ${cbOptions.space} next`);
            initFetch(cbOptions);
        }

    }

    const shiftDrops = schedule.scheduleJob('*/1 * * * *', function () {
        // const shiftDrops = schedule.scheduleJob('*/5 * * * *', function() {
        fetchDrops();
        console.log(`🔄  📅 💧 shifting older drops to the bottom until... 📅 ${endTime}`);
        console.log(` `);
    });

    const unshiftDrops = schedule.scheduleJob('*/1 * * * *', function () {
        fetchDrops(false);
        console.log(`🔄 🔥 💧 adding new  drops! 📅 ${new Date()}`);
        console.log(` `);

    });



    function messageTotal(dropCount, space, total) {

        if (dropCount) {
            console.log(`🔄 | ${space} | 💧 ${dropCount}`);
            console.log(`🔄 ----------------------------`);

        } else if (total) { }
        // console.log(`🔄 💦 total drops added: ${total - dropCount}`);
    }


};
