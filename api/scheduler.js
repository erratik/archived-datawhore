

const _ = require('lodash');
const schedule = require('node-schedule');
const Space = require('./models/spaceModel');
const Schema = require('./models/schemaModel');
const Drop = require('./models/dropModel');
const DROP_FETCH_EXTRAS = require('./constants.class').DROP_FETCH_EXTRAS;
const Utils = require('./lib/utils');
const pluck = require('./lib/utils').pluck;
const URLtoObject = require('./lib/utils').URLtoObject;

module.exports = function (app, spaces, settings, schemaGroups) {

    let startTime = new Date(Date.now() + 5000);
    let endTime = new Date(Date.now() + 60000);

    console.log('DATAWHORE SCHEDULER RUNNING');

    let schemas = {};

    const namespaces = spaces.map(space => {
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

        let n = 0;
        namespaces.forEach(namespace => {

            const types = _.uniq(_.map(schemas[namespace], 'type'));

            types.forEach(rainType => {

                    const schema =_.filter(schemas[namespace], {type: rainType})[0];

                    if (!schema || !schema.dropUrl) {
                        console.log(` no drop url set for ${rainType} on ${namespace} `);
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


                       console.log(`(${n}) fetching drops for ${rainType} on ${namespace} in ${(n*10000)/1000} seconds...`);

                        setTimeout(function() {

                            Utils.endpointSpaceCall(data, null, null, (resp) => {
                                console.log(`${resp.length} ${rainType} drops on ${namespace}`);
                                // find out if we still get results, to implement start/end
                                if (!resp.length) {
                                    endTime = Date.now();
                                }
                            });

                        }, n*10000);
                    }
            });
        });
    };

    var shiftDrops = schedule.scheduleJob('* 1 * * *', function () {

        fetchDrops();
        console.log(`Shifting older drops to the bottom until... (${endTime})`);

    });

    var unshiftDrops = schedule.scheduleJob('*/1 * * * *', function () {

        fetchDrops(false);
        console.log(`adding new  drops! (${new Date()})`);

    });
};
