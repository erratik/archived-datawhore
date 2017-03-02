import { Component, OnInit } from '@angular/core';
import {DimensionFormComponent} from '../../../shared/component/dimensions/dimensions-form/dimensions-form.component';
import {ProfileService} from '../../../services/profile/profile.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'datawhore-profile-form',
  templateUrl: 'profile-form.component.html',
  styleUrls: ['profile-form.component.less']
})
export class ProfileFormComponent  extends DimensionFormComponent implements OnInit {

  constructor(profileService: ProfileService) {
    super(profileService);
  }

  ngOnInit() {
  }

  protected saveProfile(): void {
      this.saveDimensions();
  }

}
