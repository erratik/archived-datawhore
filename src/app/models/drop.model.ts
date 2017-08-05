
export class Drop {
    constructor(public space: string,
        public type: string,
        public content: any,
        public timestamp: any) {

        // this.content = this.sanitizeDrop();
    }

    public sanitizeDrop(): any {

        Object.keys(this.content).forEach(prop => {
            switch (prop) {
                case "date":
                    // check for seconds timestamps, convert to ms
                    if (this.content[prop].length === 10) {
                        this.content[prop] = this.content[prop] * 1000;
                        this.timestamp = this.content[prop] * 1000;
                    }
                  break;

            }
            // obj[prop] = this.content[prop];
        });


        return this.content;
    }
}

