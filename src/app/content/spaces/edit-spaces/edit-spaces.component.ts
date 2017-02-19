import {Component, OnInit, Input} from '@angular/core';
import {SpacesService} from '../../../services/spaces.service';
import {SpaceModel} from '../../../models/space.model';
import {SpaceOauthSettings} from '../../../models/space-settings.model';
import 'rxjs/add/operator/map';
import {Router} from '@angular/router';

@Component({
    selector: 'datawhore-edit-spaces',
    templateUrl: './edit-spaces.component.html',
    styleUrls: ['./edit-spaces.component.less'],
    providers: [SpacesService]
})
export class EditSpacesComponent implements OnInit {

    public addingSpaces: Array<SpaceModel>;
    @Input() public isAddingSpaces = false;
    protected isLoadingSpaces = true;
    protected isLoadingSettings = true;
    protected spaces: Array<SpaceModel>;

    constructor(private spacesService: SpacesService, private router: Router) {
    }

    ngOnInit() {

        const getSpaces = this.spacesService.getAllSpaces(true)
            .do((spaces) => this.spaces = spaces)
            .do(() => this.isLoadingSpaces = false)
            .switchMap(() => this.getSpaceOauthSettings());

        getSpaces.subscribe();

    }

    private getSpaceOauthSettings(): any {

        return this.spaces.map(spaceConfig => {
            this.spacesService.getOauthSettings(spaceConfig.name).subscribe((settingsRetrieved: SpaceOauthSettings) => {
                this.spaces.filter((space: SpaceModel) => {
                    if (space.name === spaceConfig.name) {
                        space.oauth = settingsRetrieved;
                        // console.log(new Date(settingsRetrieved.modified));
                        space.makeSpaceModel({
                            name: spaceConfig.name,
                            modified: settingsRetrieved.modified,
                            oauth: settingsRetrieved
                        });
                    }
                });
                this.isLoadingSettings = false;
            });
        });
    }

    protected toggleEditSpace(space: SpaceModel): void {
        space.inEditMode = !space.inEditMode;
    }

    protected cancelSpaceAdd(space: SpaceModel): void {
        this.addingSpaces = this.addingSpaces.filter(spaces => spaces.modified !== space.modified);
    }

    public updateSpaceSettings(updatedSpace: SpaceModel): any {
        this.spacesService.updateSpace(updatedSpace).subscribe(updatingSpaceRes => {
            this.spaces = this.spaces.filter(space => {
                space.inEditMode = false;
                // debugger
                return space.makeSpaceModel({});
            });
        });
    }

}
