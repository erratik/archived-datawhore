import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {SpaceModel} from '../../models/space.model';
import {EditSpacesComponent} from '../../content/spaces/edit-spaces/edit-spaces.component';

@Component({
  selector: 'datawhore-configs',
  templateUrl: './configs.component.html',
  styleUrls: ['./configs.component.less']
})

export class ConfigsViewComponent implements OnInit {

  private static readonly NEW_SPACE_VALUE = '';

  @ViewChild(EditSpacesComponent) protected editSpacesComponent: EditSpacesComponent;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.el.nativeElement.className = 'content';
  }

  protected addNewSpace(): any {
    this.editSpacesComponent.addingSpaces.push(new SpaceModel(ConfigsViewComponent.NEW_SPACE_VALUE, Date.now()));
    this.editSpacesComponent.isAddingSpaces = true;
  }

}
