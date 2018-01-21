import { Drop } from './drop.model';
import { Activity } from 'app/models/activity.model';
import * as moment from 'moment';

export class Segment {
    constructor(
        public startTime: number,
        public endTime: number,
        public type: string,
        public place?: string,
        public activities?: Activity[],
        public drops?: Drop[]) {
    }

    public isSegmentDrop(drop: Drop, activity): boolean {
        return drop.timestamp >= activity.startTime && drop.timestamp <= activity.endTime && !['rain.segment', 'rain.storyline'].includes(drop.type);
    }

    public storeActivities(): Activity[] {
        // tslint:disable-next-line:prefer-const
        let segmentDrops = JSON.parse(JSON.stringify(this.drops));
        // debugger
        if (!!this.activities) {

            return this.activities = this.activities.map((activity: Activity) => {

                activity.startTime = Number(moment(activity.startTime).format('x'));
                activity.endTime = Number(moment(activity.endTime).format('x'));

                activity.drops = this.drops.filter((drop, i) => {
                    if (this.isSegmentDrop(drop, activity)) {
                        segmentDrops.splice(i, 1);
                    }
                    return this.isSegmentDrop(drop, activity);
                }).map(drop => new Drop(
                    drop['_id'],
                    drop.space,
                    drop.type,
                    drop.content,
                    drop.timestamp,
                    {
                        story:
                            {
                                activity: activity.activity,
                                group: activity.group
                            }
                    }
                ));
                // const test = new Activity(activity);
                // debugger;
                return new Activity(activity);

            });
            // debugger;

        } else {
            this.drops = segmentDrops.filter(drop => this.isSegmentDrop(drop, this)).map(drop => new Drop(drop['_id'], drop.space, drop.type, drop.content, drop.timestamp));
            return null;
        }
    }



}

