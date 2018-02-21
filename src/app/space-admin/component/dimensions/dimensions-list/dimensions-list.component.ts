import {Component, OnInit, Input} from '@angular/core';
import * as _ from 'lodash';


@Component({
    selector: 'dimension-list',
    templateUrl: 'dimensions-list.component.html',
    styleUrls: ['dimensions-list.component.less']
})
export class DimensionListComponent implements OnInit {

    @Input() protected model;
    public _ = _;

    constructor() {
    }

    ngOnInit() {
    }

    protected mergeArrays(val): any {

        if (typeof val === 'object' && val.length) {
            console.log(_.assign.apply(_, val));
        } else {
            // return console.log(val);
        }
    }

}
