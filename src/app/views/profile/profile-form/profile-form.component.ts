import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {DimensionFormComponent} from '../../../shared/component/dimensions/dimensions-form/dimensions-form.component';
import {ProfileService} from '../../../services/profile/profile.service';
import {DimensionSchema} from '../../../models/dimension-schema.model';
import {RainService} from '../../../services/rain/rain.service';
const objectPath = require('object-path');

@Component({
    selector: 'datawhore-profile-form',
    templateUrl: 'profile-form.component.html',
    styleUrls: ['profile-form.component.less']
})
export class ProfileFormComponent extends DimensionFormComponent implements OnInit {

    public isProfileReset = false;
    @Input() public isFetchingSchema;
    @Output() onProfileSchema = new EventEmitter<any>();

    constructor(profileService: ProfileService,
                rainService: RainService) {
        super(profileService, rainService);
    }

    ngOnInit() {

    }

    protected saveProfile(): void {
        this.saveDimensions(this.model.propertyBucket);
    }

    protected saveRawProfile(schema): any {

        this.model = objectPath.get(this.model, `content.${schema}`);
        const profileSchema$ = this.profileService.updateSchema(this.space.name, this.model).do((profileSchema) => {
            this.onProfileSchema.emit(new DimensionSchema(profileSchema['type'], profileSchema['content'], profileSchema.modified));
        });

        profileSchema$.subscribe(() => {
            this.isFetchingSchema = false;
            this.isProfileReset = false;
        });
    }

}
