import { Segment } from 'app/models/segment.model';
import { Drop } from 'app/models/drop.model';
import * as moment from 'moment';


export class Storyline {
    constructor(
        public storyline: any,
        public drops: any[],
        public timestamp: number = null,
        public segments: Segment[] = []) {

        this.timestamp = this.storyline.date;

        const dayHasStoryline = !!this.storyline && !!this.storyline.segments;
        this.segments = dayHasStoryline ? this.storyline.segments.map((segment: Segment) => {
            segment.startTime = Number(moment(segment.startTime).format('x'));
            segment.endTime = Number(moment(segment.endTime).format('x'));
            segment = new Segment(
                segment.startTime,
                segment.endTime,
                segment.type,
                segment.type === 'place' ? segment.place : null,
                !!segment.activities ? segment.activities : null,
                this.drops
            );
            segment.activities = segment.storeActivities();
            this.drops = this.drops.filter(drop => !segment.drops.filter(d => d.timestamp === drop.timestamp).length);

            return segment;
        }) : null;

        delete this.storyline;
    }


}

