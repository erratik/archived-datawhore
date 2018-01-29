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
                this.findSegmentDrops(segment, this.drops)
            );

            segment.activities = segment.storeActivities();
            segment.timestamp = segment.startTime;
            
            return segment;
        }) : null;

        delete this.storyline;
    }

    public isSegmentDrop(drop: Drop, segment): boolean {
        return drop.timestamp >= segment.startTime && drop.timestamp <= segment.endTime && !['rain.segment', 'rain.storyline'].includes(drop.type);
    }

    public findSegmentDrops(segment, drops, exclude = false): Drop[] {
        return drops.map(drop => {
            drop.inSegment = this.isSegmentDrop(drop, segment);
            return drop;
        }).filter(drop => exclude ? !drop.inSegment : drop.inSegment);
    }



}

