export class DimensionSchema {
    constructor(public type: string,
                public content: any,
                public modified: number = null,
                public propertyBucket = null) {

        this.propertyBucket = this.assignValues();
    }

    public assignValues(schema = null) {
        if (!schema) {
            schema = this.content;
        }
        // properties.map(property => makeData(schema.content));
        return Object.keys(schema).map(keyName => {

            const obj = {
                content: {
                    enabled: false,
                    label: keyName,
                    value: schema[keyName]
                },
                grouped: typeof schema[keyName] === 'object'
            };
            if (obj.grouped && obj.content['value'] !== null) {

                obj.content['value'] = this.assignValues(obj.content['value']);

            }
            if (schema[keyName] !== null) {
                return obj;
            }
        });


    }
}
