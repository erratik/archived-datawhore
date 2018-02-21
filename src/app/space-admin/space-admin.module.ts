
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import * as _ from 'lodash';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgDatepickerModule } from 'ng2-datepicker';
import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';

import { OauthSettingsService } from './services/oauth-settings.service';

import { HeaderComponent } from '../wrapper/header/header.component';
import { ContainerComponent } from '../wrapper/container/container.component';
import { FooterComponent } from '../wrapper/footer/footer.component';
import { DoughnutChartComponent } from '../shared/ui/charts/donut-chart/donut-chart.component';
import { ColorPickerComponent } from '../shared/ui/tools/color-picker/color-picker.component';
import { DatePickerComponent } from '../shared/ui/tools/date-picker/date-picker.component';

import { AddSpaceComponent } from '../space-admin/component/add-space/add-space.component';
import { ProfileFormComponent } from '../space-admin/component/profile-form/profile-form.component';
import { SpaceConfigComponent } from '../space-admin/component/space-config/space-config.component';
import { ProfileConfigComponent } from '../space-admin/component/profile-config/profile-config.component';
import { RainConfigComponent } from '../space-admin/component/rain-configs/rain-configs.component';
import { DimensionListComponent } from '../space-admin/component/dimensions/dimensions-list/dimensions-list.component';
import { DimensionFormComponent } from '../space-admin/component/dimensions/dimensions-form/dimensions-form.component';


@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    ChartsModule,
    ColorPickerModule,
    NgDatepickerModule
  ],
  declarations: [
    FileSelectDirective,
    HeaderComponent,
    ContainerComponent,
    FooterComponent,
    AddSpaceComponent,
    ProfileFormComponent,
    SpaceConfigComponent,
    RainConfigComponent,
    DimensionListComponent,
    DimensionFormComponent,
    DoughnutChartComponent,
    ColorPickerComponent
  ],
  exports: [
    HeaderComponent,
    ContainerComponent,
    FooterComponent,
    AddSpaceComponent,
    ProfileFormComponent,
    SpaceConfigComponent,
    RainConfigComponent,
    DimensionListComponent,
    DimensionFormComponent,
    DoughnutChartComponent,
    ColorPickerComponent,
  ],
  providers: [
    OauthSettingsService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class SpaceAdminModule {
  constructor() {
  }
}
