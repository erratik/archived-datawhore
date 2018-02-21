export class RainDimension {
    constructor(public friendlyName: string,
                public schemaPath: string,
                public type: string,
                public id: string) {
    }
}

export class Rain {
    constructor(public space: string,
                public properties: Array<RainDimension>,
                public rainType: string = null,
                public modified?: number) {
    }

}
