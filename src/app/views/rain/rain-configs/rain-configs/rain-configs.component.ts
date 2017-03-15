import {Component, OnInit, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {Rain} from '../../../../models/rain.model';
import {Space} from '../../../../models/space.model';
import {SpacesService} from '../../../../services/spaces.service';

@Component({
    selector: 'datawhore-rain-configs',
    templateUrl: './rain-configs.component.html',
    styleUrls: ['./rain-configs.component.less'],
    providers: [SpacesService]
})
export class RainConfigsComponent implements OnInit, OnChanges {

    @Input() protected space: Space;
    @Input() protected rain: Array<Rain>;
    @Input() protected schemas;
    @Input() protected updateRainSchema: () => {};
    @Input() protected newDimensions: () => {};
    @Input() protected isFetchingSchema = false;
    @Output() onResetRain = new EventEmitter<any>();
    protected editRainMode = false;
    protected activeTab;
    protected rainFetchUrl: string;
    protected newRainType: string;


    constructor(private spacesService: SpacesService) {
    }

    ngOnInit() {
    }
    ngOnChanges() {
        this.getActiveTab();
    }

    public setActiveTab(tabName: string): void {
        this.activeTab = tabName;
        console.log(this.activeTab);
    }

    protected getActiveTab(): any {
        // this.spacesService.spaceRainSchemas$.subscribe((stuff) => {
        //     console.log(stuff)
        // });
        // debugger;
        return this.activeTab = this.schemas.length ? this.schemas[0].type : 'new-schema';
    }
}
