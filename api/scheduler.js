
const _ = require('lodash');
const Utils = require('./lib/utils');
const pluck = require('./lib/utils').pluck;
const URLtoObject = require('./lib/utils').URLtoObject;
const schedule = require('node-schedule');
const Space = require('./models/spaceModel');
const Schema = require('./models/schemaModel');
const Drop = require('./models/dropModel');

let namespaces = [];

let dropRanEmpties = 0;
let dropCountLastRun = 0;
let totalOldDropsAdded = 0;
let pastDropRuntimes = 0;
let oldDropsAdded = {};


module.exports = function (app, spaces, settings, schemaGroups) {

    console.log(``);
    console.log('👄 👄 👄 ----------- CUM DUMPTRUCK RUNNING ------------- 👄 👄 👄');
    console.log(``);

    let startTime = new Date(Date.now() + 5000);
    let endTime = new Date(Date.now() + 60000 * 5);;

    let schemas = {};

    namespaces = spaces.map(space => {
        schemas[space.name] = [];
        oldDropsAdded[space.name] = 0;
        return space.name
    });

    schemaGroups = schemaGroups.map(s => s.schemas.filter(o => {
        if (o.type.includes('rain')) {
            schemas[s.space].push(o);
            return o;
        }
    }));

    const fetchDrops = (isFetchingPast = true) => {

        let n = 0;
        namespaces.forEach(namespace => {


            const types = _.uniq(_.map(schemas[namespace], 'type'));

            types.forEach(rainType => {

                const schema = _.filter(schemas[namespace], { type: rainType })[0];

                if (!schema || !schema.dropUrl) {
                    console.log(`[!] no drop url set for ${rainType} on ${namespace} `);
                    endTime = Date.now();

                } else {
                    n++;
                    const data = {
                        action: 'drops.fetch',
                        apiEndpointUrl: schema.dropUrl,
                        contentPath: schema.contentPath,
                        type: rainType,
                        space: namespace,
                        isFetchingPast: isFetchingPast
                    }


                    setTimeout(function () {

                        // console.log(`fetching drops for ${rainType} on ${namespace}...`);
                        Utils.endpointSpaceCall(data, null, null, (resp, dropCount) => {
                            // find out if we still get results, to implement start/end

                            if (!dropCount) {
                                dropCallback(isFetchingPast, 0, namespace);
                                return;
                            }

                            dropCallback(isFetchingPast, dropCount, namespace);

                        });

                    }, n * 500);
                }
            });
        });
    };

    const shiftDrops = schedule.scheduleJob('*/1 * * * *', function () {
        fetchDrops();
        console.log(`💧 💧 💧 shifting older drops to the bottom until... 📅 ${endTime}`);
        console.log(``);
    });

    const unshiftDrops = schedule.scheduleJob('*/5 * * * *', function () {
        fetchDrops(false);
        // console.log(`💦 adding new  drops! 📅 ${new Date()}`);
    });


    const dropCallback = (isFetchingPast, dropCount, space) => {

            if (isFetchingPast) {
                oldDropsAdded[space] += dropCount;
                Object.keys(oldDropsAdded).forEach(o => totalOldDropsAdded += oldDropsAdded[o]);

                if (pastDropRuntimes === namespaces.length) {
                    pastDropRuntimes = 0;
                    dropCountLastRun = totalOldDropsAdded;
                    if (!totalOldDropsAdded && !dropCountLastRun) {
                        if (dropRanEmpties === 3) {
                            console.log(``);
                            console.log('💀 💀 💀 -------------->  KILLED CUM DUMPTRUCK @ 📅 ' + new Date());
                            console.log(``);
                            shiftDrops.cancel();
                            return;
                        }
                        dropRanEmpties++;
                    }
                    totalOldDropsAdded = 0;
                    console.log('🌙 🌙 🌙 ----------- CUM DUMPTRUCK GOING TO SLEEP ------------- 🌙 🌙 🌙');
                } else {
                messageTotal(dropCount, space, totalOldDropsAdded);

                    pastDropRuntimes++;
                    console.log('pastDropRuntimes has run', pastDropRuntimes, 'times');
                    console.log(``);
                }


            } else {
                messageTotal(dropCount, space, totalOldDropsAdded);
            }
    }

    function messageTotal(dropCount, space, total) {

        if (dropCount) {
            console.log(`| ${space} | 💧 ${dropCount}`);
            console.log(`----------------------------`);
        } else if (totalOldDropsAdded) {
            console.log(`💦 total drops added: ${total}`);
        }
    }


};
