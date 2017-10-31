const EndpointService = require('../services/endpoint.service');
const objectPath = require('object-path');

module.exports = {
    get: (data, cb) => {
        
        const endpointService = objectPath.get(EndpointService, data.action);
        if (typeof endpointService === 'function') {
            return endpointService(data, function(resp) {
                //FIXME: refactor
                if (!!resp && !!resp.length && data.type.includes('rain')) {
                    resp = resp.map(schema => {
                        // schema.content = JSON.stringify(schema.content);
                        return schema;
                    });
                }
                
                cb(resp);
            }, data.query);
        } else {
            cb({ service: data.action, message: 'no endpoints set for ' + data.action });
        }
    },
    post: (data, content, cb) => {

        const endpointService = objectPath.get(EndpointService, data.action);
         
        if (data.type.includes('rain') && !data.action.includes('update')) 
            content['fetchUrl'] = data.fetchUrl;
        
        return endpointService(data, content, (resp) => {
            cb(resp);
        });
    },
    responseHandler: (res, cb) => {
        if (res) {
            cb(resp);
        }
    }
};
