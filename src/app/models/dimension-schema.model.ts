

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
            // debugger;
            const obj = {
                content: {
                    enabled: !!(rainProperties && rainProperties.filter(({schemaPath}) => schemaPath === path).length),
                    label: keyName,
                    value: schema[keyName],
                    friendlyName: friendlyName,
                    schemaPath: path
                },
                grouped: typeof schema[keyName] === 'object'
            };

            if (obj.grouped && obj.content['value'] !== null) {
                obj.content['value'] = this.assignValues(rainProperties, obj.content['value'], path);
            }

            if (schema[keyName] !== null) {
                return obj;
            }
        });
    }
}
