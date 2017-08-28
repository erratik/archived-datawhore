

export class DimensionSchema {
    constructor(public type: string,
                public content: any,
                public modified: number = null,
                public fetchUrl?: string,
                public dropUrl?: string,
                public contentPath?: string,
                public id?: any,
                public dropCount?: string,
                public propertyBucket = null) {

    }

    public assignValues(rainProperties = null, schema = null, prefix = null) {
        if (!schema) {
            schema = this.content || [];
            prefix = 'content';
        }

        return Object.keys(schema).map(keyName => {

            const path = prefix + '.' + keyName;
            // todo: get the friendly names that already exist before rewriting them!
            const friendlyName = path.replace('.', '_').replace(prefix + '_', '');
            
            const matchedDimension = rainProperties.filter(({schemaPath}) => schemaPath === path);
            const obj = {
                content: {
                    enabled: !!(rainProperties && matchedDimension.length),
                    label: keyName,
                    value: schema[keyName],
                    friendlyName: friendlyName,
                    schemaPath: path
                },
                grouped: typeof schema[keyName] === 'object'
            };

            if (!!matchedDimension.length) {
                obj.content['id'] = matchedDimension[0].id;
                obj.content['friendlyName'] = matchedDimension[0].friendlyName;
            }

            if (obj.grouped && obj.content['value'] !== null) {
                obj.content['value'] = this.assignValues(rainProperties, obj.content['value'], path);
            }

            if (schema[keyName] !== null) {
                return obj;
            }
        });
    }
}
