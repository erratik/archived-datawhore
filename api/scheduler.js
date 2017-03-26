

const _ = require('lodash');
const schedule = require('node-schedule');
const Space = require('./models/spaceModel');
const Schema = require('./models/schemaModel');
const Drop = require('./models/dropModel');
const DROP_FETCH_EXTRAS = require('./constants.class').DROP_FETCH_EXTRAS;
const Utils = require('./lib/utils');
const pluck = require('./lib/utils').pluck;
const URLtoObject = require('./lib/utils').URLtoObject;

module.exports = function (app, spaces, settings) {

    let startTime = new Date(Date.now() + 5000);
    let endTime = new Date(Date.now() + 60000);

    const namespaces = spaces.map(space => space.name);

    const fetchDrops = (isFetchingPast = true) => {

        namespaces.forEach(namespace => {
            const spaceSettings = settings.filter(settings => settings.space === namespace);
            // console.log(spaceSettings);
            Drop.findDrops(namespace, 'drops', function (_data) {
                // find all drop types
                // console.log(_.uniq(_.map(_data.drops, 'type')));
                const types = _.uniq(_.map(_data.drops, 'type'));
                // find the content path
                types.forEach(rainType => {
                    Schema.findSchema(namespace, rainType, (schema) => {
                        // console.log(schema[0]);

                        const data = {
                            action: 'drops.fetch',
                            apiEndpointUrl: schema[0].dropUrl,
                            contentPath: schema[0].contentPath,
                            type: rainType,
                            space: namespace,
                            isFetchingPast: isFetchingPast
                        }

                        Utils.endpointSpaceCall(data, null, null, (resp) => {
                            console.log('docs added (not done yet)', resp.length);
                            // find out if we still get results, to implement start/end
                            if (!resp.length) {
                                endTime = Date.now();
                            }
                        });

                    });
                });
            });
        });
    };

    var shiftDrops = schedule.scheduleJob('* * */24 * * *', function () {

        fetchDrops();
        console.log(`Shifting drops to the bottom until... (${endTime})`);

    });

    var unshiftDrops = schedule.scheduleJob('* */3 * * * *', function () {

        fetchDrops(false);
        console.log(`Added drops! (${Date.now()})`);

    });
};
