import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Rain} from '../../../../models/rain.model';
import {Space} from '../../../../models/space.model';

@Component({
    selector: 'datawhore-rain-configs',
    templateUrl: './rain-configs.component.html',
    styleUrls: ['./rain-configs.component.less']
})
export class RainConfigsComponent implements OnInit {

    @Input() protected space: Space;
    @Input() protected rain: Array<Rain>;
    @Input() protected schemas: Array<any>;
    @Input() protected updateRainSchema: () => {};
    @Input() protected newDimensions: () => {};
    @Output() onResetRain = new EventEmitter<any>();
    protected editRainMode = false;
    protected activeTab = 'rain';


    constructor() {
    }

    ngOnInit() {
    }

    public setActiveTab(tabName: string): void {
        this.activeTab = tabName;
    }
}
