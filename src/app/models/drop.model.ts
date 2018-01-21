
export class Drop {
    constructor(
        public id: string,
        public space: string,
        public type: string,
        public content: any,
        public timestamp: any,
        public story?: any) {

        this.content = this.sanitizeDrop();
    }

    public sanitizeDrop(): any {

        Object.keys(this.content).forEach(prop => {
            switch (prop) {
                case 'date':
                    this.content[prop] = this.timestamp;
                  break;

            }
        });

        return this.content;
    }
}

