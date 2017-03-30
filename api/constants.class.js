const _ = require('lodash');
const moment = require('moment');

module.exports = {
    DROP_FETCH_PARAMS: function(space, isFetchingPast = true, data = null) {

        let params;
        const dropTimestamp = data.drops ? _.minBy(data.drops, (o) => o['timestamp']) : null;
        const isTumblrFetchingPast = isFetchingPast;
        isFetchingPast = isFetchingPast && dropTimestamp;
        switch (space) {
            case 'tumblr':
                params = { limit: 20 };
                if (isTumblrFetchingPast) {
                     params.offset = data.drops.length;
                }
              break;
            case 'spotify':
                params = { limit: 20 };
                if (isFetchingPast) {
                    params.before = dropTimestamp['timestamp'];
                }
              break;
            case 'instagram':
                params = { count: 5 };
                if (isFetchingPast) {
                    params.max_id = dropTimestamp['content']['id'];
                }
              break;
            case 'swarm':
                params = {
                    limit: 20,
                    v: Date.now()
                };
                if (isFetchingPast) {
                    params.beforeTimestamp = dropTimestamp['content']['createdAt'];
                }
              break;
            case 'twitter':
                params = {
                    count: 20,
                    screen_name: 'erratiktart',

                };
                if (isFetchingPast) {
                    params.beforeTimestamp = dropTimestamp['content']['createdAt']/1000;
                }
              break;
            case 'dribbble':
                params = { per_page: 30 };
                // if (isFetchingPast) {
                //     params.date = moment(_.minBy(data.drops, (o) => o['content']['id'])['content']['created']).unix().format('YYYY-MM-DD');
                // }
              break;
        }

        return params;
    }
};
