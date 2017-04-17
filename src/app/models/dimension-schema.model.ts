

export class DimensionSchema {
    constructor(public type: string,
                public content: any,
                public modified: number = null,
                public fetchUrl?: string,
                public dropUrl?: string,
                public contentPath?: string,
                public id?: any,
                public propertyBucket = null) {


        if (!this.type.includes('rain')) {
            this.propertyBucket = this.assignValues();
        }
    }

    public assignValues(schema = null, prefix = null) {
        if (!schema) {
            schema = this.content || [];
            prefix = 'content';
        }

        return Object.keys(schema).map(keyName => {

            const path = prefix + '.' + keyName;
            // todo: get the friendly names that already exist before rewriting them!
            const friendlyName = path.replace('.', '_').replace(prefix + '_', '');

            const obj = {
                content: {
                    enabled: false,
                    label: keyName,
                    value: schema[keyName],
                    friendlyName: friendlyName,
                    schemaPath: path
                },
                grouped: typeof schema[keyName] === 'object'
            };

            if (obj.grouped && obj.content['value'] !== null) {
                obj.content['value'] = this.assignValues(obj.content['value'], path);
            }

            if (schema[keyName] !== null) {
                return obj;
            }
        });
    }
}
