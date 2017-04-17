const _ = require('lodash');
const moment = require('moment');

module.exports = {
    DROP_FETCH_PARAMS: function(space, isFetchingPast = true, data = null) {

        let params;
        const dropTimestamp = data && data.drops ? _.minBy(data.drops, (o) => o['timestamp']) : null;
        const isTumblrFetchingPast = isFetchingPast;
        isFetchingPast = Boolean(isFetchingPast && dropTimestamp);
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
                    count: 10,
                    screen_name: 'erratiktart',

                };
                if (isFetchingPast) {
                    params.beforeTimestamp = dropTimestamp['content']['createdAt']/1000;
                }
              break;
            case 'dribbble':
                params = { per_page: 30 };
                if (isFetchingPast) {
                    // params.date = moment(_.minBy(data.drops, (o) => o['content']['id'])['content']['created']).unix().format('YYYY-MM-DD');
                }
              break;
            case 'moves':
                params = { date: moment().format('YYYYMMDD') };
                if (isFetchingPast) {
                    params.date = moment(dropTimestamp['timestamp']).subtract(1, 'days').format('YYYYMMDD');
                }
              break;
            case 'facebook':

                const extraFields = '{full_picture,id,link,story_tags,with_tags,place,type,message_tags,shares,likes,picture,permalink_url,attachments{media,url,type},message,privacy,created_time,comments,updated_time}';
                params = { fields: 'posts.limit(20)' + extraFields };
                if (isFetchingPast) {
                    params = { fields: 'posts.limit(20)' + extraFields };
                    params.date = moment(dropTimestamp['timestamp']).subtract(1, 'days').format('YYYYMMDD');
                }
                // params = { fields: 'posts.limit(1){full_picture,id,link,story_tags,with_tags,place,type,message_tags,shares,likes,picture,permalink_url,attachments{media,url,type},reactions,comments,updated_time}' };
                // if (isFetchingPast) {
                //     params.date = moment(dropTimestamp['timestamp']).subtract(1, 'days').format('YYYYMMDD');
                // }
              break;
        }

        return params;
    }
};
