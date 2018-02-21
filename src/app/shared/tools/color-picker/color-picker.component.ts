import { SpacesService } from '../../../shared/services/spaces.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'datawhore-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css']
})


export class ColorPickerComponent implements OnInit {

  @Input() public color: string;
  @Output() public onColorChange: EventEmitter<string> = new EventEmitter<string>();
  constructor(private spacesService: SpacesService) { }

  ngOnInit() {
  }

  public changeColor(color: string): void {
    this.onColorChange.emit(color);
  }


}
