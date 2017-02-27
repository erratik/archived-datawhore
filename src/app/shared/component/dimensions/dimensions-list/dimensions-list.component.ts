import {Component, OnInit, Input} from '@angular/core';

@Component({
    selector: 'datawhore-dim-list',
    templateUrl: 'dimensions-list.component.html',
    styleUrls: ['dimensions-list.component.less']
})
export class DimensionListComponent implements OnInit {

    @Input() protected model;

    constructor() {
    }

    ngOnInit() {
    }

}
