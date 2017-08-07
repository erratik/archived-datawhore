const _ = require('lodash');
const Utils = require('./lib/utils');
const pluck = require('./lib/utils').pluck;
const URLtoObject = require('./lib/utils').URLtoObject;
const schedule = require('node-schedule');
const Space = require('./models/spaceModel');
const Schema = require('./models/schemaModel');
const Drop = require('./models/dropModel');
const NamespaceService = require('./services/namespace.service');

let namespaces = [];
let dropCountLastRun = 0;
let pastDropRuntimes = 0;
let dropsToFetch;

module.exports = function(app, spaces, settings, schemaGroups) {

    console.log(``);
    console.log('👄 👄 👄 ----------- CUM DUMPTRUCK RUNNING ------------- 👄 👄 👄');
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

            types.forEach(rainType => {

                const schema = _.filter(schemas[namespace], {
                    type: rainType
                })[0];

                if (!schema || !schema.dropUrl) {
                    console.log(`[!] no drop url set for ${rainType} on ${namespace} `);
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


                    setTimeout(() => {

                        dropsToFetch++;
                        NamespaceService.endpointSpaceCall(data, null, null, (resp) => {
                            // find out if we still get results, to implement start/end
                            // console.log('resp', resp, data);
                            let dropCount = resp.length || 0;

                            dropCountLastRun += dropCount;

                            if (!dropCount) {
                                dropCallback(isFetchingPast, dropCount, namespace);
                                return;
                            } else if (dropCountLastRun <= dropCountLastRun - dropCount) {

                                console.log(``);
                                console.log('💀 💀 💀 -------------->  KILLED CUM DUMPTRUCK @ 📅 ' + new Date());
                                console.log(``);
                                shiftDrops.cancel();
                                return;
                            }


                            messageTotal(dropCount, namespace, dropCountLastRun);

                            dropCallback(isFetchingPast, dropCount, namespace);

                        });

                    }, dropsToFetch * 500);
                }
            });
        });
    };

    // const shiftDrops = schedule.scheduleJob('*/1 * * * *', function() {
        const shiftDrops = schedule.scheduleJob('*/5 * * * *', function() {
        fetchDrops();
        console.log(`💧 💧 💧 shifting older drops to the bottom until... 📅 ${endTime}`);
        console.log(``);
    });

    const unshiftDrops = schedule.scheduleJob('*/1 * * * *', function() {
        fetchDrops(false);
        console.log(`🔥 🔥 🔥 adding new  drops! 📅 ${new Date()}`);
        console.log(``);

    });


    const dropCallback = (isFetchingPast, dropCount, space) => {

        if (isFetchingPast) {

            if (pastDropRuntimes === dropsToFetch) {
                pastDropRuntimes = 0;

            } else {

                pastDropRuntimes++;
                console.log(``);
            }

        }


    }

    function messageTotal(dropCount, space, total) {

        if (dropCount) {
            console.log(`| ${space} | 💧 ${dropCount}`);
            console.log(`----------------------------`);

        } else if (total) {}
        console.log(`💦 total drops added: ${total - dropCount}`);
    }


};
