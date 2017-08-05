export class RainDimension {
    constructor(public friendlyName: string,
                public schemaPath: string,
                public type: string) {
    }
}

export class Rain {
    constructor(public space: string,
                public properties: Array<RainDimension>,
                public rainType: string = null,
                public modified?: number) {
    }


    // public createPropertyBucket(propertyBucket) {
    //     // find all properties on the profile and make them enabled
    //     // 1. needed for this dimension form to display values as enabled
    //     // debugger;
    //     if (this.properties) {
    //         this.properties.map((property, i) => {

    //             if (propertyBucket[i]) {

    //                 if (propertyBucket[i].content.schemaPath === property.schemaPath) {
    //                     propertyBucket[i].content.enabled = true;
    //                     propertyBucket[i].content.friendlyName = property.friendlyName;
    //                 }

    //                 if (propertyBucket[i].grouped) {
    //                     this.createPropertyBucket(propertyBucket[i].content.value);
    //                 }

    //             }

    //         });
    //     }

    //     return propertyBucket;
    // }
}
