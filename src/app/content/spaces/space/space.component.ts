import {Component, OnInit, Input} from '@angular/core';
import {SpaceModel} from '../../../models/space.model';
import {SpacesService} from '../../../services/spaces.service';
import {SpaceOauthSettings} from '../../../models/space-settings.model';
import {FileUploader} from 'ng2-file-upload';
import {Paths} from '../../../classes/paths.class';

@Component({
    selector: 'datawhore-space',
    templateUrl: './space.component.html',
    styleUrls: ['./space.component.less']
})
export class SpaceComponent implements OnInit {

    @Input() protected space: SpaceModel;

    public uploader: FileUploader;

    constructor(private spacesService: SpacesService) {}

    ngOnInit() {
        this.getSpaceOauthSettings();
        this.uploader = new FileUploader({url: `${Paths.DATAWHORE_API_URL}/upload/${this.space.name}/space/icon`});
    }

    private getSpaceOauthSettings(): any {

        this.spacesService.getOauthSettings(this.space.name).subscribe((settingsRetrieved: SpaceOauthSettings) => {

            // this.spaces.filter((space: SpaceModel) => {
            //   if (space.name === spaceConfig.name) {
            this.space.oauth = settingsRetrieved;

            this.space.toSpaceSettings({
                name: this.space.name,
                modified: settingsRetrieved.modified,
                oauth: settingsRetrieved
            });

            //   }
            //
            // });
            // this.isLoadingSettings = false;
        });
    }

    protected toggleEditSpace(space: SpaceModel): void {
        space.inEditMode = !space.inEditMode;
    }

    protected getSpaceModel(spaceName: string): any {
        return this.spacesService.getSpace(spaceName).subscribe(space => {
            console.log(space);
        });
    }
    public updateSpaceSettings(updatedSpace: SpaceModel): any {
        this.spacesService.updateSpace(updatedSpace).subscribe(updatingSpaceRes => {

            this.space.inEditMode = false;
            return this.space.toSpaceSettings({});
        });
    }

}
