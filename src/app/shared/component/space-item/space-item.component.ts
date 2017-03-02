import {Component, OnInit, Input} from '@angular/core';
import {Dimension} from '../../../models/profile.model';
import {ProfileService} from '../../../services/profile/profile.service';

@Component({
  selector: 'datawhore-space-item',
  templateUrl: './space-item.component.html',
  styleUrls: ['./space-item.component.less']
})
export class SpaceItemComponent implements OnInit {

  @Input() protected space: string;
  @Input() protected type: string;
  @Input() protected properties: Array<Dimension>;
  protected schema: any;

  constructor(private profileService: ProfileService) { }

  ngOnInit() {
    const itemSchema$ = this.profileService.fetchSchema(this.space).do((rawSchema) => this.schema = rawSchema);
    itemSchema$.subscribe();
  }

}
