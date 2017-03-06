import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {DimensionFormComponent} from '../../../shared/component/dimensions/dimensions-form/dimensions-form.component';
import {ProfileService} from '../../../services/profile/profile.service';
import {DimensionSchema} from '../../../models/dimension-schema.model';
import {Observable} from 'rxjs';
import {SpaceOauthSettings} from '../../../models/space-settings.model';
const objectPath = require('object-path');

@Component({
    selector: 'datawhore-profile-form',
    templateUrl: 'profile-form.component.html',
    styleUrls: ['profile-form.component.less']
})
export class ProfileFormComponent extends DimensionFormComponent implements OnInit {

    public isProfileReset = false;
    public profileSchema;
    public isFetchingSchema;
    @Output() onProfileSchema = new EventEmitter<any>();

    constructor(profileService: ProfileService) {
        super(profileService);
    }

    ngOnInit() {

    }

    protected saveProfile(): void {
        this.saveDimensions();
    }

    protected saveRawProfile(schema): any {

        schema = objectPath.get(this.profileSchema, `content.${schema}`);
        // schema = this.profileSchema.content;
        debugger;
        const profileSchema$ = this.profileService.updateSchema(this.space.name, schema).do((profileSchema) => {
            this.onProfileSchema.emit(new DimensionSchema(profileSchema['type'], profileSchema['content'], profileSchema.modified));
        });

        profileSchema$.subscribe(() => {
            this.isFetchingSchema = false;
            this.isProfileReset = false;
        });
    }

}
