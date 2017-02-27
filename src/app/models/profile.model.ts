

export class Dimension {
    constructor(public friendlyName: string,
                public schemaPath: string) {}
}

export class Profile {
    constructor(public space: string,
                public properties: Array<Dimension>,
                public modified?: number) {
        this.properties = this.assignProperties();
    }

    private assignProperties(): Array<Dimension> {
        return this.properties.map(dim => new Dimension(dim.friendlyName, dim.schemaPath));
    }

    public enablePropertyBucket(propertyBucket) {
        this.properties.map(property => {

            propertyBucket.filter(bucketProp => {
                if (bucketProp && bucketProp.content.schemaPath === property.schemaPath) {
                    bucketProp.content.enabled = true;
                }
            })

        });

        return propertyBucket;
       }
}
