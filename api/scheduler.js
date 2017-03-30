
const _ = require('lodash');
const Utils = require('./lib/utils');
const pluck = require('./lib/utils').pluck;
const URLtoObject = require('./lib/utils').URLtoObject;
const schedule = require('node-schedule');
const Space = require('./models/spaceModel');
const Schema = require('./models/schemaModel');
const Drop = require('./models/dropModel');

let namespaces = [];

let dropCountLastRun = 0;
let totalOldDropsAdded = 0;
let pastDropRuntimes = 0;
let oldDropsAdded = {};


module.exports = function (app, spaces, settings, schemaGroups) {

    let startTime = new Date(Date.now() + 5000);
    let endTime = new Date(Date.now() + 60000);

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
        console.log(``);
        console.log('👄 👄 👄 ----------- CUM DUMPTRUCK RUNNING ------------- 👄 👄 👄');
        console.log(``);
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

    var shiftDrops = schedule.scheduleJob('*/1 * * * *', function () {

        fetchDrops();
        console.log(`💧 💧 💧 shifting older drops to the bottom until... (📅 ${endTime})`);

    });

    var unshiftDrops = schedule.scheduleJob('*/30 * * * *', function () {

        fetchDrops(false);
        console.log(`🔥 🔥 🔥 🔥 adding new  drops! 💧 💧 💧 (📅 ${new Date()})`);

    });

    const dropCallback = (isFetchingPast, dropCount, space) => {
        if (isFetchingPast) {
            oldDropsAdded[space] += dropCount;
            Object.keys(oldDropsAdded).forEach(o => totalOldDropsAdded += oldDropsAdded[o]);
            console.log(`💦 drops bukkake\'d on ${space}: ${dropCount} | 💧 total drops added: ${totalOldDropsAdded}`);

            if (pastDropRuntimes === namespaces.length) {
                pastDropRuntimes = 0;
                dropCountLastRun = totalOldDropsAdded;
                if (!totalOldDropsAdded && !dropCountLastRun) {
                    console.log('stop fetching drops now! @ ' + new Date());
                }
                totalOldDropsAdded = 0;
                console.log('🌙 🌙 🌙 ----------- CUM DUMPTRUCK GOING TO SLEEP ------------- 🌙 🌙 🌙');
            } else {
                pastDropRuntimes++;
            }

            console.log('pastDropRuntimes has run', pastDropRuntimes, 'times');
            console.log(``);

        }
    };

};
