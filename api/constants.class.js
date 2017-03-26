const _ = require('lodash');

module.exports = {
    DROP_FETCH_EXTRAS: function(space, isFetchingPast = true, data = null) {
        switch (space) {
            case 'instagram':
                let params = { count: 5 };
                if (isFetchingPast) {
                    params.max_id = _.minBy(data.drops, (o) => o['content']['id'])['content']['id'];
                }
                return params;
              break;
        }
    }
};
