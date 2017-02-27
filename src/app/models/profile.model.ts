

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

    private assignProperties() {
        return this.properties.map(dim => new Dimension(dim.friendlyName, dim.schemaPath));
    }
}
