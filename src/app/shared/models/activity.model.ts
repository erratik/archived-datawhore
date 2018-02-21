import { Drop } from './drop.model';

export class Activity {
  constructor(
    public activityObject: any,
    public drops: Drop[] = null,
    public timestamp: number = null,
    public endTime: number = null,
    public startTime: number = null,
    public activity: string = null,
    public group: string = null,
    public distance: number = null,
    public duration: number = null,
    public steps: number = null,
    public trackPoints: any = null) {

    Object.keys(activityObject).forEach(key => this[key] = activityObject[key]);
    delete this.activityObject;

  }


}

