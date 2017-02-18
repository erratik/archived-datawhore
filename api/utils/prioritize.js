var tools = module.exports = makeData;
var _ = require('lodash');

makeData.assignValues = assignValues;
makeData.writeProperties = writeProperties;
makeData.isSimpleProperty = isSimpleProperty;
makeData.findValues = findValues;

function isSimpleProperty(value) {

    //if (_.isString(value)) console.log('('+value+') is a string!');
    //if (_.isBoolean(value)) console.log('('+value+') is a boolean!');
    //if (_.isArray(value)) console.log('('+value+') is an array!');
    //if (_.isNumber(value)) console.log('('+value+') is a number!');

    if (_.isString(value) ||  _.isBoolean(value) || _.isArray(value) || _.isNumber(value) ) {
        return true;
    } else {
        return false;
    }

}

function assignValues(node) {

    var obj = {};

    _.forEach(node, function(n, key) {


        if (isSimpleProperty(n)) {

            obj[key] = {
                content: {
                    label: key,
                    value: n,
                    enabled: false
                },
                grouped: false
            };

        } else {

            var groupedAttr = {
                grouped: true, content: {}
            };



            _.forEach( n, function(item, name) {
                if (isSimpleProperty(item)) {
                    groupedAttr.content[name] = makeData(item, name).content;

                } else {
                    groupedAttr.content[name] = {content: {}, grouped: true, label: name};

                    //console.log('~~~~~~~~~ '+name+' ~~~~~~~~~');

                    _.forEach(item, function(i, k){
                        if (isSimpleProperty(i)) {
                            //console.log(i);
                            groupedAttr.content[name].content[k] = makeData(i, k).content;
                        } else {

                        }
                    });
                    //console.log('....................................');
                }
            });
            obj[key] = groupedAttr;

        }

    });
    //obj.grouped = false;
    //console.log('------------ @end assignValues');
    return obj;
}

function makeData(val, label) {
    //console.log('make data running');
    var obj = {
        content: {
            enabled: false,
            label: label,
            value: val
        }

    };

    if (_.isArray(val)) {
        obj.content = _.first(val);
        obj.content = assignValues(obj.content);
        obj.grouped = true;
        obj.is_arr = true;
    } else {

        obj.grouped = false;
    }
    return obj;
}

function mapAttributeKeys(item, prefix) {
    var keys = {};
    var attributeName = prefix+"__"+item.label;
    keys[attributeName] = {
        friendlyName: item.label
    };
    keys[attributeName].path = prefix+"__"+item.label;
    return keys;
}

function writeProperties(props, current) {
    // this will return mapped properties, but only the ones enabled

    //console.log('>> @start writeProperties()');

    if (current === undefined) {current = false;}
    var deleting = {};
    var savedProps = {};
    var properties = _.map(_.filter(props, {content: { 'enabled':  true }}), 'content');
    var attributeGroup = _.map(_.filter(props, 'grouped'), 'content');
    _.forEach(attributeGroup, function(attribute, cle){
        _.forEach(attribute, function(item, key){
            // second level
            if (item.enabled) {
                properties.push(mapAttributeKeys(item, _.findKey(props, {content: attribute}),  {content: attribute}));
            } else if (!item.grouped && !item.enabled){
                //console.log(item.label+' is disabled');
                if (current !== false)
                    delete current[item.label];
            }

            //third level
            if (item.grouped) {
                var innerGroup = _.filter(item.content, 'enabled');
                _.forEach(innerGroup, function(group){
                    //console.log(group);
                    var groupKey = _.findKey(item.content, group);
                    var query = {};
                    query[key] = {content: {}};
                    query[key].content[groupKey] = group;

                    if (group !== undefined) {

                        //console.log(query);
                        //console.log(findKey(props, {content: query})+'__'+key);
                        //console.log(mapAttributeKeys(_.first(innerGroup), _.findKey(props, {content: query})+'__'+key));

                        properties.push(mapAttributeKeys(group, _.findKey(props, {content: query})+'__'+key,  {content: query}));
                    }

                });
                if (current !== false) {
                    // when i update the properties, if some do not exist anymore, I need to delete them
                    var disabledGroups = _.filter(item.content, 'enabled', false);
                    var disabledGroupKey = _.findKey(item.content, _.first(innerGroup));
                    var disabledQuery = {};
                    disabledQuery[key] = {content: {}};
                    disabledQuery[key].content[disabledGroupKey] = _.first(disabledGroups);

                    deleting[_.findKey(props, {content: disabledQuery})+'__'+key+'__'+disabledGroupKey] = true;
                    //console.log(_.findKey(props, {content: disabledQuery})+'__'+key+'__'+disabledGroupKey);
                    //console.log(disabledGroups);
                }

            }

        });
    });
    // todo: why is this happening for every property?
    _.forEach(properties, function(item, key){
        //console.log(properties);

        if (item.label !== undefined) {
            //first & second level
            if (current[item.label] !== undefined) {
                //console.log(current);
                savedProps[item.label] = current[item.label];
            } else {

                savedProps[item.label] = {
                    friendlyName: item.label,
                    path: item.label
                };

            }
        } else {
            // third level
            _.merge(savedProps, item);
            if (_.filter(current, item)) _.merge(savedProps, current);

            // when i update the properties, if some do not exist anymore, I need to delete them
            if (_.filter(deleting, item) && current !== false) _.reject(savedProps, item);
        }
    });

    //console.log(savedProps);
    //console.log('>> /@end writeProperties()');
    return savedProps;

}


function findValues(post, split, prop, obj){

    _.forEach(split, function(dataProperty, cle){
        if (isSimpleProperty(post[dataProperty])) {
            //console.log(post[dataProperty]);
            obj[prop.friendlyName] = post[dataProperty];
        } else {
            //console.log(dataProperty, split[cle+1]);
            var query = '';

            _.forEach(split, function(part, i){
                query += part;
                if (i != split.length-1) query += '.';
            });

            //console.log(query);
            var objects = [];
            objects.push(post);
            var mapped = _.map(objects, _.property(query));

            //console.log(mapped);
            //console.log( prop.friendlyName);

            obj[prop.friendlyName] = _.first(mapped);

        }
    });

}