
export class PropObj {
    constructor(public label?: string,
                public value?: string,
                public keyName?: string) {
    }

    public castValues(haystack, needle, replace): string {
        return haystack.replace(needle, replace);
    }
}
