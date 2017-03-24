export class Dimension {
    constructor(public friendlyName: string,
                public schemaPath: string,
                public type: string) {
    }
}

export class Rain {
    constructor(public space: string,
                public properties: Array<Dimension>,
                public dropType: string = null,
                public modified?: number) {
        if (this.properties) {
            this.properties = this.assignProperties();
        }
    }

    private assignProperties(): Array<Dimension> {
        return this.properties.filter(dim => new Dimension(dim.friendlyName, dim.schemaPath, dim.type));
    }

    public createPropertyBucket(propertyBucket) {
        // find all properties on the profile and make them enabled
        // 1. needed for this dimension form to display values as enabled
        if (this.properties) {
            this.properties.map(property => {
                propertyBucket.filter(bucketProp => {
                    if (bucketProp && bucketProp.content.schemaPath === property.schemaPath) {
                        bucketProp.content.enabled = true;
                        bucketProp.content.friendlyName = property.friendlyName;
                    }
                    if (bucketProp && bucketProp.grouped) {
                        this.createPropertyBucket(bucketProp.content.value);
                    }
                })

            });
        }

        return propertyBucket;
    }
}
